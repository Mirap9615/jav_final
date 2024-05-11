import java.io.File;
import java.io.FileNotFoundException;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;
import java.util.stream.Collectors;
import java.util.LinkedHashMap;

public class FileAnalyzerPathBased {
    public static FileAnalysisObject parseFile(String filePath) throws FileNotFoundException {
        File file = new File(filePath);
        if (!file.exists()) {
            throw new FileNotFoundException("File not found: " + filePath);
        }

        return analyzeFile(file);
    }

    private static FileAnalysisObject analyzeFile(File file) throws FileNotFoundException {
        int wordCount = 0, letterCount = 0, symbolCount = 0, allCount = 0;
        Map<String, Integer> wordCounter = new HashMap<>();

        try (Scanner scanner = new Scanner(file)) { // try-with resources sounds cool
            while (scanner.hasNextLine()) {
                String line = scanner.nextLine();

                String[] words = line.split("\\s+");
                for (String word : words) { // compacts both word and letter count
                    boolean isWord = true;
                    for (int i = 0; i < word.length(); i++) {
                        char currLetter = word.charAt(i);
                        if (!Character.isLetter(currLetter)) { isWord = false; symbolCount++; } else {
                            letterCount++;
                        }
                        allCount++;
                    }
                    if (isWord) {
                        wordCount++;
                        String standardedWord = word.toLowerCase();
                        wordCounter.put(standardedWord, wordCounter.getOrDefault(standardedWord, 0) + 1);
                    }
                }
            }
        }

        // solution from: https://stackoverflow.com/a/22132422: descending sort by key value
        Map<String, Integer> sortedByWordCount = wordCounter.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));

        return new FileAnalysisObject(wordCount, letterCount, symbolCount, allCount, sortedByWordCount);
    }
}
