import { S3Client, PutObjectCommand, GetObjectCommand,DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


type  filetype  =  "image/jpg" | "image/jpeg" | "image/png" | "application/pdf"


const awsClient : S3Client = new S3Client({
    region : process.env.S3_REGION as string,
    credentials : {
        accessKeyId : process.env.S3_ACCESS_KEY as string,
        secretAccessKey : process.env.S3_SECRET_ACCESS_KEY as string
    }
});

async function uploadDocument(filename : string , filetype : filetype) {
    const command = new PutObjectCommand({
        Bucket : process.env.S3_BUCKET,
        Key : `${process.env.S3_PATH}/${filename}`,
        ContentType : filetype
    });
    const url = await getSignedUrl(awsClient,command);
    return url;
}

async function getDocument(filename : string , filetype : filetype){
    const command = new GetObjectCommand({
        Bucket : process.env.S3_BUCKET,
        Key : `${process.env.S3_PATH}/${filename}`,
    });
    const url = await getSignedUrl(awsClient,command,{expiresIn : 20 });
    return url
}

async function deleteDocument(filename : string){
    const command = new DeleteObjectCommand({
        Bucket : process.env.S3_BUCKET,
        Key : `${process.env.S3_PATH}/${filename}`,
    });
    await awsClient.send(command);
}

// New functions for shared files

/**
 * Generate a presigned URL for uploading a shared file
 */
async function getSharedFileUploadUrl(fileKey: string, contentType: string, expiresIn: number = 900) {
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: fileKey,
        ContentType: contentType
    });
    const url = await getSignedUrl(awsClient, command, { expiresIn });
    return url;
}

/**
 * Generate a presigned URL for viewing a shared file
 */
async function getSharedFileViewUrl(fileKey: string, expiresIn: number = 3600) {
    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: fileKey,
    });
    const url = await getSignedUrl(awsClient, command, { expiresIn });
    return url;
}

/**
 * Delete a shared file
 */
async function deleteSharedFile(fileKey: string) {
    const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: fileKey,
    });
    await awsClient.send(command);
}

export {
    getDocument,
    uploadDocument,
    deleteDocument,
    getSharedFileUploadUrl,
    getSharedFileViewUrl,
    deleteSharedFile
};