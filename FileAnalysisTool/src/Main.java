import java.io.File;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class Main {
    private static final String BASE_PATH = "/Users/mira/Desktop/Hub/jav_final";
    private static final String RELATIVE_PATH = "/files";

    public static void main(String[] args) {
        File basePath = new File(BASE_PATH);
        File rootDirectory = new File(basePath, RELATIVE_PATH);
        ExecutorService executor = Executors.newFixedThreadPool(4);

        executor.shutdown();
        try {
            if (!executor.awaitTermination(90, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException ie) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
