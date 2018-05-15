import fs from 'fs'

exports.serve = (req, resp) => {
  res.send(fs.readFileSync('index.html'))
}
