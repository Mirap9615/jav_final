**Project Submission: .txt File Analysis Website (and bonus Admin Panel)**\
William Zhou wwz2003\ 
\
Dear Professor Katz-Braunschweig, this is my submission for the final project. I had promised,\
- file I/O and handling\
- text analysis, both trivial (such as word count) and nontrivial (perhaps with the involvement of AI text analysis libraries)\ 
- thread concurrency, so that user requests can be resolved in parallel\
- networking in java, in order to communicate with the existing Node.js backend of my website, both to send and receive packets\
- Sockets and concurrency control\
\
**Setup**\
For the java server, (developed using the jetbrains compiler):\

cd FileAnalysisTool\
javac -d out src/*.java\
java -cp out FileAnalysisTool\
\
For the java AdminPanel,\
\
cd AdminPanel\
javac -d out src/*.java\
java -cp out AdminPanel\
\
For the node.js server,\
\
[new terminal]\
cd jav_final\
npm install\
npm run build\
npm run start\
http://localhost:3001/\
\
**Overview and Thoughts**\
The project includes three parts:\
- a React frontend with a Node.js server\
- a Java server that processes input text files\
- a Java-based Admin Control Panel\
\
The java server FileAnalysisTool receives file content directly (and autonomously) via multi-thread input/output streaming and processes the data. It then returns a JSONized form of a FileAnalysisObject, which holds information about word count, letter count and word frequency, all of which from analysis by FileAnalyzer. It also allows the user to choose words to replace in the text file.\

Meanwhile, AdminPanel watches over the /uploads directory and allows the deletion of all files in the folder. It uses watchers to monitor the directory, and communicates with the node js server when a delete succeeds in order to allow it to refresh the frontend and the metadata dictionary fileMetadata. If I had more time, I would completely implement the dynamic page refresh, but the three-pronged server system has gotten to me with my limited time. Currently, ghost writes are still possible. Concurrency control has been the most challenging and most underaddressed aspect of this project.\

I believe this project, even ignoring all the frontend and node.js code, satisfies most of what I promised. file I/O and handling via both java mini projects. Text analysis via FileAnalyzer. Thread concurrency in FileAnalyzer (ExecutorService and HTTP Handlers), and networking / sockets / concurrency control present in both, http in FileAnalyzer and base Sockets in AdminPanel.\