package services

import (
	"bytes"
	"fmt"
	"io"
	"log"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

type S3Uploader struct {
	svc    *s3.S3
	bucket string
}

func NewS3Uploader(region, bucket string) (*S3Uploader, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(region),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	return &S3Uploader{
		svc:    s3.New(sess),
		bucket: bucket,
	}, nil
}

func (u *S3Uploader) UploadFile(bucketName, objectKey string, file io.Reader) error {
	data, err := io.ReadAll(file)
	if err != nil {
		log.Printf("Error reading file %v: %v\n", objectKey, err)
		return err
	}

	body := bytes.NewReader(data)

	_, err = u.svc.PutObject(&s3.PutObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
		Body:   body,
	})
	if err != nil {
		return err
	}

	return nil
}

func (u *S3Uploader) DeleteFile(bucketName, objectKey string) error {
	_, err := u.svc.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
	})
	if err != nil {
		return err
	}

	return nil
}
