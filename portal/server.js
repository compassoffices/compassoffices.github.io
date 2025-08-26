const express = require('express');
const multer = require('multer');
const SftpClient = require('ssh2-sftp-client');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('.'));

app.post('/upload', upload.single('file'), async (req, res) => {
    const sftp = new SftpClient();
    try {
        await sftp.connect({
            host: '35.241.115.157',
            port: 13097,
            username: 'compassoffices',
            password: req.body.password
        });
        await sftp.put(req.file.path, `/home/compassoffices/${req.file.originalname}`);
        await sftp.end();
        res.redirect('/?status=File uploaded successfully!');
    } catch (err) {
        res.redirect('/?status=Upload failed: ' + err.message);
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
