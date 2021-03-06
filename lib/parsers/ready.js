'use strict';
const Buffer = require('safe-buffer').Buffer;
const inherits = require('util').inherits;
const Transform = require('stream').Transform;

function ReadyParser(options) {
  if (!(this instanceof ReadyParser)) {
    return new ReadyParser(options);
  }
  Transform.call(this, options);

  options = options || {};

  if (options.delimiter === undefined) {
    throw new TypeError('"delimiter" is not a bufferable object');
  }

  if (options.delimiter.length === 0) {
    throw new TypeError('"delimiter" has a 0 or undefined length');
  }

  this.delimiter = Buffer.from(options.delimiter);
  this.readOffset = 0;
  this.ready = false;
}

inherits(ReadyParser, Transform);

ReadyParser.prototype._transform = function(chunk, encoding, cb) {
  if (this.ready) {
    this.push(chunk);
    return cb();
  }
  const delimiter = this.delimiter;
  let chunkOffset = 0;
  while (this.readOffset < delimiter.length && chunkOffset < chunk.length) {
    if (delimiter[this.readOffset] === chunk[chunkOffset]) {
      this.readOffset++;
    } else {
      this.readOffset = 0;
    }
    chunkOffset++;
  }
  if (this.readOffset === delimiter.length) {
    this.ready = true;
    this.emit('ready');
    const chunkRest = chunk.slice(chunkOffset);
    if (chunkRest.length > 0) {
      this.push(chunkRest);
    }
  }
  cb();
};

module.exports = ReadyParser;
