import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;

public class FileAnalysisTool {

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/analyze", new FileHandler());
        server.createContext("/replace", new ReplacementHandler());

        ExecutorService multiExecutor = Executors.newFixedThreadPool(8);
        server.setExecutor(multiExecutor);

        server.start();
        System.out.println("Server started on port 8080");
    }

    static class FileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange t) throws IOException {
            if ("POST".equals(t.getRequestMethod())) {
                String fileExtension = t.getRequestHeaders().getFirst("File-Extension");
                InputStream currFile = t.getRequestBody();
                FileAnalysisObject response = processFile(currFile, fileExtension);

                assert response != null; // always returns a FileAnalysisObject, even if empty
                String jsonResponse = response.toJson();
                t.sendResponseHeaders(200, jsonResponse.getBytes().length);

                try (OutputStream os = t.getResponseBody()) {
                    os.write(jsonResponse.getBytes());
                }

            } else {
                String response = "Invalid request method";
                t.sendResponseHeaders(405, response.getBytes().length);
                OutputStream os = t.getResponseBody();
                os.write(response.getBytes());
                os.close();
            }
        }

        private FileAnalysisObject processFile(InputStream file, String fileExtension) throws IOException {
            System.out.println(fileExtension);
            if (fileExtension.equalsIgnoreCase(".txt")) {
                System.out.println("txt file");
                return FileAnalyzer.analyzeFile(file);
            }
            System.out.println(fileExtension + " file, not processable yet");
            return null;
        }
    }

    static class ReplacementHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange t) throws IOException {
            if ("POST".equals(t.getRequestMethod())) {
                InputStream fileStream = t.getRequestBody();
                String originalWord = t.getRequestHeaders().getFirst("Original-Word");
                String newWord = t.getRequestHeaders().getFirst("New-Word");

                String replacedText = replaceWords(fileStream, originalWord, newWord);

                t.sendResponseHeaders(200, replacedText.getBytes().length);
                try (OutputStream os = t.getResponseBody()) {
                    os.write(replacedText.getBytes());
                }
            } else {
                String response = "Invalid request method";
                t.sendResponseHeaders(405, response.getBytes().length);
                try (OutputStream os = t.getResponseBody()) {
                    os.write(response.getBytes());
                }
            }
        }

        private String replaceWords(InputStream fileStream, String originalWord, String newWord) {
            java.util.Scanner s = new java.util.Scanner(fileStream).useDelimiter("\\A");
            String result = s.hasNext() ? s.next() : "";
            return result.replaceAll(originalWord, newWord);
        }
    }
}