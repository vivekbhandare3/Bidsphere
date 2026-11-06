package in.hp.main.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {
    @Autowired
    private S3Client s3Client;
    private final String bucket="bidsphere-images";

    public String uploadFile(MultipartFile file) throws IOException{
        String filename= UUID.randomUUID()+"_"+file.getOriginalFilename();
        s3Client.putObject(
                PutObjectRequest.builder().bucket(bucket)
                        .key(filename)
                        .contentType(file.getContentType())
                        .build(),
                RequestBody.fromBytes(file.getBytes())
        );
        System.out.println("Bucket: " + bucket);
        System.out.println("Region: " + s3Client.serviceClientConfiguration().region());
        return filename;
    }
}
