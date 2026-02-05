const { S3Client, CreateBucketCommand, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true,
});

async function setupMinio() {
  const bucketName = process.env.MINIO_BUCKET || 'shakti-yoga-assets';

  try {
    console.log(`Creating bucket: ${bucketName}...`);
    await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
    console.log('Bucket created successfully.');

    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };

    console.log('Setting public policy...');
    await s3.send(
      new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(policy),
      })
    );
    console.log('Bucket policy set to public.');
  } catch (err) {
    if (err.Code === 'BucketAlreadyOwnedByYou') {
      console.log('Bucket already exists.');
    } else {
      console.error('Error creating bucket:', err);
    }
  }
}

setupMinio();
