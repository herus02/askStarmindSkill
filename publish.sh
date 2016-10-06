#!/usr/bin/env bash
rm index.zip
cd lambda 
zip -X -r index.zip *
mv index.zip ../
cd .. 
aws lambda update-function-code --function-name askStarmind --zip-file fileb://index.zip
