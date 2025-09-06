@echo off
echo Starting MongoDB...
cd /d "C:\Program Files\MongoDB\Server\7.0\bin"
mongod --dbpath "C:\data\db"
pause