// Suppress AWS SDK v2 maintenance warning to keep logs clean
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

class S3Service {
  constructor() {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'ap-south-1'
    });
    this.s3 = new AWS.S3();
    this.bucketName = process.env.AWS_S3_BUCKET || 'arogya-vault-images';
  }

  // Generate presigned URL for upload
  async getPresignedUploadUrl(fileName, fileType) {
    const s3Key = `uploads/${Date.now()}-${uuidv4()}-${fileName}`;

    const params = {
      Bucket: this.bucketName,
      Key: s3Key,
      ContentType: fileType,
      Expires: 2592000 // 1 month (30 days)
    };

    try {
      const uploadUrl = await this.s3.getSignedUrlPromise('putObject', params);
      return {
        uploadUrl,
        s3Key,
        bucketName: this.bucketName
      };
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw error;
    }
  }

  // Upload file directly to S3
  async uploadFile(fileBuffer, fileName, fileType, folder = 'general') {
    const s3Key = `${folder}/${Date.now()}-${uuidv4()}-${fileName}`;

    const params = {
      Bucket: this.bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: fileType,
      ACL: 'private'
    };

    try {
      const result = await this.s3.upload(params).promise();
      return {
        s3Key: result.Key,
        fileUrl: result.Location,
        eTag: result.ETag
      };
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  }

  // Get presigned URL for download
  async getPresignedDownloadUrl(s3Key) {
    const params = {
      Bucket: this.bucketName,
      Key: s3Key,
      Expires: 2592000 // 1 month (30 days)
    };

    try {
      const url = await this.s3.getSignedUrlPromise('getObject', params);
      return url;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw error;
    }
  }

  // Delete file from S3
  async deleteFile(s3Key) {
    const params = {
      Bucket: this.bucketName,
      Key: s3Key
    };

    try {
      await this.s3.deleteObject(params).promise();
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw error;
    }
  }

  // List files in bucket
  async listFiles(prefix = '') {
    const params = {
      Bucket: this.bucketName,
      Prefix: prefix,
      MaxKeys: 100
    };

    try {
      const data = await this.s3.listObjectsV2(params).promise();
      return data.Contents || [];
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  // Get file metadata
  async getFileMetadata(s3Key) {
    const params = {
      Bucket: this.bucketName,
      Key: s3Key
    };

    try {
      const data = await this.s3.headObject(params).promise();
      return {
        size: data.ContentLength,
        mimeType: data.ContentType,
        lastModified: data.LastModified
      };
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw error;
    }
  }

  // Batch delete files
  async batchDeleteFiles(s3Keys) {
    const objects = s3Keys.map(key => ({ Key: key }));

    const params = {
      Bucket: this.bucketName,
      Delete: {
        Objects: objects
      }
    };

    try {
      const result = await this.s3.deleteObjects(params).promise();
      return {
        deleted: result.Deleted,
        errors: result.Errors
      };
    } catch (error) {
      console.error('Error batch deleting files:', error);
      throw error;
    }
  }
}

module.exports = new S3Service();
