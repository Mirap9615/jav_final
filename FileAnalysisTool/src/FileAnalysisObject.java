import java.util.Map;

public class FileAnalysisObject { // to allow the returning of multiple different types of objects at once
    private final int wordCount;
    private final int letterCount;
    private final int symbolCount;
    private final int totalCount;
    private final Map<String, Integer> wordFrequency;

    public FileAnalysisObject(int wordCount, int letterCount, int symbolCount, int totalCount, Map<String, Integer> wordFrequency) {
        this.wordCount = wordCount;
        this.letterCount = letterCount;
        this.symbolCount = symbolCount;
        this.totalCount = totalCount;
        this.wordFrequency = wordFrequency;
    }

    public String toJson() { // in place of third-party solutions which are a pain to import
        StringBuilder jsonBuilder = new StringBuilder();
        jsonBuilder.append("{");
        jsonBuilder.append("\"wordCount\":").append(wordCount).append(",");
        jsonBuilder.append("\"letterCount\":").append(letterCount).append(",");
        jsonBuilder.append("\"symbolCount\":").append(symbolCount).append(",");
        jsonBuilder.append("\"totalCount\":").append(totalCount).append(",");
        jsonBuilder.append("\"wordFrequency\":{");
        for (Map.Entry<String, Integer> entry : wordFrequency.entrySet()) {
            jsonBuilder.append("\"").append(entry.getKey()).append("\":").append(entry.getValue()).append(",");
        }
        if (!wordFrequency.isEmpty()) {
            jsonBuilder.deleteCharAt(jsonBuilder.length() - 1);
        }
        jsonBuilder.append("}");
        jsonBuilder.append("}");
        return jsonBuilder.toString();
    }
}