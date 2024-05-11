const express = require('express');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const multer = require('multer'); 
const app = express();
app.use(express.json());
const PORT = 3001;
const { v4: uuidv4 } = require('uuid');
const fsPromises = require('fs').promises;
const net = require('net');

// temporary uploads also streamline memory management 
const clearUploadsFolder = () => {
    return new Promise((resolve, reject) => {
        const directory = 'uploads/';
        fs.readdir(directory, (err, files) => {
            if (err) {
                reject(err);
                return;
            }
            if (files.length === 0) {
                resolve();
            } else {
                let deletedCount = 0;
                for (const file of files) {
                    fs.unlink(path.join(directory, file), err => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        deletedCount++;
                        if (deletedCount === files.length) {
                            resolve();
                        }
                    });
                }
            }
        });
    });
};

// storage engine by multer (only proceeds when files are cleared)
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        clearUploadsFolder()
            .then(() => cb(null, 'uploads/'))
            .catch(err => cb(err));

    },
    filename: function(req, file, cb) {
        const fileId = uuidv4();
        cb(null, fileId + '-' + file.fieldname + '-' + Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage }); 

let lastAnalysisResult = {};
const fileMetadata = {};

app.post('/upload', upload.array('file'), async (req, res) => {

    try {
        const files = req.files; 
        const responses = [];

        for (const file of files) {
            const fileId = file.filename.split('-')[0];
            const filePath = file.path;  
            const fileExtension = path.extname(file.originalname);

            fileMetadata[fileId] = {
                path: filePath,
                name: file.originalname,
                extension: fileExtension
            };

            const fileMem = fs.readFileSync(filePath);
            const fileContents = fs.readFileSync(filePath, 'utf8');

            const response = await axios.post('http://localhost:8080/analyze', fileMem, {
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'File-Extension': fileExtension
                }
            });

            responses.push({
                fileId,
                ...response.data,
                fileContents
            });
        }

        lastAnalysisResult = responses;
        res.send({ message: 'Files processed', data: responses });
    
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error processing files' });
    }
});

app.get('/last-analysis', (req, res) => {
    res.json(lastAnalysisResult);
});

// replacement
app.post('/replace', async (req, res) => {
    const { fileId, originalWord, newWord } = req.body;

    if (!fileMetadata[fileId]) {
        return res.status(404).send({ message: 'File not found' });
    }

    const filePath = fileMetadata[fileId].path;
    try {
        const fileBuffer = await fsPromises.readFile(filePath);

        const response = await axios.post('http://localhost:8080/replace', fileBuffer, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Original-Word': originalWord,
                'New-Word': newWord
            }
        });

        if (response.status === 200) {

            await fsPromises.writeFile(filePath, response.data);

            const refreshResponse = await axios.post('http://localhost:3001/refresh');

            if (refreshResponse.status === 200) {
                console.log('Refresh successful');
                res.send({ message: 'Replacement and refresh successful', data: refreshResponse.data });
            } else {
                throw new Error('Refresh failed');
            }
        } else {
            throw new Error('Replacement failed');
        }
    } catch (error) {
        console.error('Error in replace-words endpoint:', error);
        res.status(500).send({ message: 'Server error during word replacement', details: error.message });
    }
});

// refresh refactoring: so that server can call it with ease 
async function refreshFileData() {
    try {
        const responses = [];

        for (const fileId in fileMetadata) {
            const metadata = fileMetadata[fileId];
            if (!fs.existsSync(metadata.path)) {
                continue;
            }
            const fileMem = fs.readFileSync(metadata.path);
            const response = await axios.post('http://localhost:8080/analyze', fileMem, {
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'File-Extension': metadata.extension
                }
            });

            responses.push({
                fileId,
                ...response.data,
                fileContents: fileMem.toString('utf8')
            });
        }

        lastAnalysisResult = responses;
        io.emit('update', { message: 'Data updated' });
        return responses; 
    } catch (error) {
        console.error('Error reprocessing files:', error);
        throw error;
    }
}

// refresh posting
app.post('/refresh', async (req, res) => {
    try {
        const responses = await refreshFileData();
        res.send({ message: 'Files reprocessed', data: responses });
    } catch (error) {
        res.status(500).send({ message: 'Error during file reprocessing', details: error.message });
    }
});

// serve + catch alls
app.use(express.static(path.join(__dirname, '..', 'build')));

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        next(); 
    } else {
        res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// to ensure consistency with Java AdminPanel 
const server = net.createServer(socket => {
    console.log('Java AdminPanel connected');

    socket.on('data', async data => {
        message = data.toString();
        console.log('Received data from Java AdminPanel:', message);

        if (message.startsWith("File deleted:")) {
            const filename = message.slice("File deleted:".length).trim();
            const fileId = filename.split('-')[0]; 
            if (fileMetadata[fileId]) {
                delete fileMetadata[fileId];
                console.log(`File entry for ${fileId} deleted, alongside its entry in fileMetadata.`);
                await refreshFileData();
                socket.write(`Refresh successful.`);
            } else {
                console.log(`No metadata found for file ID ${fileId}`);
                socket.write(`No metadata found for file ID ${fileId}`);
            }
        } else {
            socket.write("Received your message: " + message);
        }

        socket.write("Received notice of file deletion");
    });

    socket.on('end', () => {
        console.log('Java AdminPanel disconnected');
    });
});

server.listen(1337, '127.0.0.1', () => {
    console.log('Server listening for Java AdminPanel on port 1337');
});

const frontendCommunicator = require('http').createServer(app);
const io = require('socket.io')(frontendCommunicator);

io.on('connection', (socket_two) => {
    console.log('Client connected');

    socket_two.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

frontendCommunicator.listen(1992, () => {
    console.log('frontendCommunicator listening on port 1992');
});