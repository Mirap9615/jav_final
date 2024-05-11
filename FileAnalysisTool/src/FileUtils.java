import java.io.File;
import java.util.concurrent.ExecutorService;

// outdated
/*
public class FileUtils {
    public static void printFiles(File base, File root, ExecutorService executor) {
        File[] files = root.listFiles();
        if (files != null) {
            for (File f : files) {
                if (f.isFile()) {
                    executor.submit(() -> {
                        try {
                            FileAnalysisObject result = FileAnalyzer.parseFile(f.getPath());
                            if (result != null) {
                                // Prepare sorted words string
                                StringBuilder sortedWordsBuilder = new StringBuilder("{");
                                result.getWordFrequency().forEach((word, freq) -> sortedWordsBuilder.append(word).append(": ").append(freq).append(", "));
                                if (sortedWordsBuilder.length() > 1) {
                                    sortedWordsBuilder.setLength(sortedWordsBuilder.length() - 2);
                                }
                                sortedWordsBuilder.append(" }");

                                String output = String.format("{ File %s: %d words, %d letters, %d symbols, %d total tokens; Sorted Words: %s}",
                                        f.getName(), result.getWordCount(), result.getLetterCount(), result.getSymbolCount(), result.getTotalCount(), sortedWordsBuilder);

                                System.out.println(output);
                            }
                        } catch (Exception e) {
                            System.out.println("Error processing file: " + e.getMessage());
                        }
                    });
                } else if (f.isDirectory()) {
                    printFiles(base, f, executor);  // Recursion
                }
            }
        } else {
            System.out.println("Failed to list files");
        }
    }
}
*/