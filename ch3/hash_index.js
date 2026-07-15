import fs from 'node:fs';
import { Buffer } from 'node:buffer';

// create an in-memory hash map to store the key-value pairs
const map = new Map();
let offset = 0;
let maxlen = 0;

//const args = process.argv.slice(2);
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  const input = chunk.toString().trim();
  // capture the digits(key) and the rest of the string (value) after whitespace
  let row = /(\d+)\s*(.+)?/.exec(input) || [];
  console.log('input:', row);
  if (row.length == 0) {
    console.error('Invalid input. Please provide a key and a value.');
  }
  row = row.slice(1).map(x => x?.trim().replace(/'/g, ``)).filter(Boolean);
  if (row.length == 1) {
    const rowOffset = map.get(row[0]);
    if (rowOffset !== undefined) {
      const fd = fs.openSync('db.txt', 'r');
      const buffer = Buffer.alloc(maxlen);
      fs.readSync(fd, buffer, 0, buffer.length, rowOffset);
      const value = buffer.toString('utf-8').split('\n')[0]
      console.log(`Value for key ${row[0]}: ${value.replace(`${row[0]},`, '')}`);
      fs.closeSync(fd);
    }
  } else {
      try {
        // if this works, then continue, otherwise catch the error and log it
        JSON.parse(row[1]);      

        const strlen = new Blob([row.join(',')]).size;
        if (strlen > maxlen) {
          maxlen = strlen;
        }
        // only take the first two arguments and convert them to a buffer
        const buf = Buffer.from(row.join(',')+'\n', 'utf-8');
        if (fs.existsSync('db.txt')) {
          offset = fs.statSync('db.txt').size;
          fs.appendFileSync('db.txt', buf);
        } else {
          fs.writeFileSync('db.txt', buf);
        }
        map.set(row[0], offset);
      } catch (err) {
        console.error('Error data input', err);
      }
    }
});