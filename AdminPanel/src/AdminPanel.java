import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.Socket;
import java.nio.file.*;
import static java.nio.file.StandardWatchEventKinds.*;

public class AdminPanel extends JFrame {
    private DefaultTableModel model;
    private WatchService watcher;
    private JTable table;
    Socket socket;
    PrintWriter out;

    public AdminPanel() throws IOException {
        setTitle("Files in /uploads");
        setSize(900, 400);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        socket = new Socket("127.0.0.1", 1337);
        out = new PrintWriter(socket.getOutputStream(), true);

        setupTable();
        setupWatcher();
        startWatching();

        addWindowListener(new java.awt.event.WindowAdapter() {
            @Override
            public void windowClosing(java.awt.event.WindowEvent windowEvent) {
                closeResources();
            }
        });
    }

    private void setupTable() {
        model = new DefaultTableModel();
        model.addColumn("File Name");

        table = new JTable(model);
        JScrollPane scrollPane = new JScrollPane(table);
        add(scrollPane, BorderLayout.CENTER);

        JButton deleteButton = new JButton("Delete Selected File");
        deleteButton.addActionListener(e -> deleteSelectedFile());
        add(deleteButton, BorderLayout.SOUTH);

        populateTable();
    }

    private void deleteSelectedFile() {
        int selectedRow = table.getSelectedRow();
        if (selectedRow >= 0) {
            String fileName = (String) model.getValueAt(selectedRow, 0);
            File fileToDelete = new File("../jav_final/uploads", fileName);
            if (fileToDelete.delete()) {
                JOptionPane.showMessageDialog(this, "File deleted successfully.");
                sendMessageToServer("File deleted: " + fileName);
                populateTable();
            } else {
                JOptionPane.showMessageDialog(this, "Failed to delete file.");
            }
        }
    }

    private void populateTable() {
        SwingUtilities.invokeLater(() -> {
            String relativePath = "../jav_final/uploads";
            File uploadsDir = new File(relativePath);
            if (uploadsDir.exists() && uploadsDir.isDirectory()) {
                File[] files = uploadsDir.listFiles();
                if (files != null) {
                    model.setRowCount(0); // Clear existing rows first
                    for (File file : files) {
                        model.addRow(new Object[]{file.getName()});
                    }
                }
            }
        });
    }

    private void setupWatcher() {
        try {
            Path dir = Paths.get("../jav_final/uploads");
            watcher = FileSystems.getDefault().newWatchService();
            dir.register(watcher, ENTRY_CREATE, ENTRY_DELETE);
            startWatching();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void startWatching() {
        Thread watcherThread = new Thread(() -> {
            try {
                while (true) {
                    WatchKey key = watcher.take();
                    for (WatchEvent<?> event : key.pollEvents()) {
                        if (event.kind() == ENTRY_CREATE || event.kind() == ENTRY_DELETE) {
                            populateTable();
                        }
                    }
                    key.reset();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        watcherThread.setDaemon(true);
        watcherThread.start();
    }

    private void sendMessageToServer(String message) {
        if (out != null) {
            out.println(message);
        } else {
            System.out.println("Socket is not connected.");
        }
    }

    private void closeResources() {
        try {
            if (out != null) {
                out.close();
            }
            if (socket != null) {
                socket.close();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        EventQueue.invokeLater(() -> {
            AdminPanel frame;
            try {
                frame = new AdminPanel();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            frame.setVisible(true);
        });
    }
}
