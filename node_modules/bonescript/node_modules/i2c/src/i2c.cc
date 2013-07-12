#include <node.h>
#include <node_buffer.h>
#include <v8.h>
#include <fcntl.h>
#include <stdint.h>
#include <errno.h>
#include <sys/ioctl.h>
#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include "i2c-dev.h"

using namespace v8;
int fd;
int8_t addr;

void setAddress(int8_t addr) {
  int result = ioctl(fd, I2C_SLAVE_FORCE, addr);
  if (result == -1) {
    ThrowException(
      Exception::TypeError(String::New("Failed to set address"))
    );
  }
}

Handle<Value> SetAddress(const Arguments& args) {
  HandleScope scope;

  addr = args[0]->Int32Value();
  setAddress(addr);

  return scope.Close(Undefined());
}

Handle<Value> Scan(const Arguments& args) {
  HandleScope scope;

  int i, res;
  Local<Function> callback = Local<Function>::Cast(args[0]);
  Local<Array> results(Array::New(128));
  Local<Value> err = Local<Value>::New(Null());

  for (i = 0; i < 128; i++) {
    setAddress(i);
    if ((i >= 0x30 && i <= 0x37) || (i >= 0x50 && i <= 0x5F)) {
      res = i2c_smbus_read_byte(fd);
    } else { 
      res = i2c_smbus_write_quick(fd, I2C_SMBUS_WRITE);
    }
    if (res >= 0) {
      res = i;
    }
    results->Set(i, Integer::New(res));
  }

  setAddress(addr);

  const unsigned argc = 2;
  Local<Value> argv[argc] = { err, results };
  callback->Call(Context::GetCurrent()->Global(), argc, argv);

  return scope.Close(results);
}

Handle<Value> Close(const Arguments& args) {
  HandleScope scope;

  if (fd > 0) {
    close(fd);
  }
  return scope.Close(Undefined());
}

Handle<Value> Open(const Arguments& args) {
  HandleScope scope;

  String::Utf8Value device(args[0]);

  Local<Value> err = Local<Value>::New(Null());

  fd = open(*device, O_RDWR);
  if (fd == -1) {
    err = Exception::Error(String::New("Failed to open I2C device"));
  }

  if (args[1]->IsFunction()) {
    const unsigned argc = 1;
    Local<Function> callback = Local<Function>::Cast(args[1]);
    Local<Value> argv[argc] = { err };

    callback->Call(Context::GetCurrent()->Global(), argc, argv);
  }

  return scope.Close(Undefined());
}

Handle<Value> ReadByte(const Arguments& args) {
  HandleScope scope;
  
  Local<Value> data; 
  Local<Value> err = Local<Value>::New(Null());

  int8_t res = i2c_smbus_read_byte(fd);

  if (res == -1) { 
    err = Exception::Error(String::New("Cannot read device"));
  } else {
    data = Integer::New(res);
  }

  if (args[0]->IsFunction()) {
    const unsigned argc = 2;
    Local<Function> callback = Local<Function>::Cast(args[0]);
    Local<Value> argv[argc] = { err, data };

    callback->Call(Context::GetCurrent()->Global(), argc, argv);
  }
  return scope.Close(data);
}

Handle<Value> ReadBlock(const Arguments& args) {
  HandleScope scope;

  int8_t cmd = args[0]->Int32Value();
  int32_t len = args[1]->Int32Value();
  uint8_t data[len]; 
  Local<Value> err = Local<Value>::New(Null());
  node::Buffer *buffer =  node::Buffer::New(len);

  Local<Object> globalObj = Context::GetCurrent()->Global();
  Local<Function> bufferConstructor = Local<Function>::Cast(globalObj->Get(String::New("Buffer")));
  Handle<Value> constructorArgs[3] = { buffer->handle_, v8::Integer::New(len), v8::Integer::New(0) };
  Local<Object> actualBuffer = bufferConstructor->NewInstance(3, constructorArgs);

  while (fd > 0) {
    if (i2c_smbus_read_i2c_block_data(fd, cmd, len, data) != len) {
      err = Exception::Error(String::New("Error reading length of bytes"));
    }

    memcpy(node::Buffer::Data(buffer), data, len);

    if (args[3]->IsFunction()) {
      const unsigned argc = 2;
      Local<Function> callback = Local<Function>::Cast(args[3]);
      Local<Value> argv[argc] = { err, actualBuffer };
      callback->Call(Context::GetCurrent()->Global(), argc, argv);
    }
 
    if (args[2]->IsNumber()) {
      int32_t delay = args[2]->Int32Value();
      usleep(delay * 1000);
    } else {
      break;
    }
  }
  return scope.Close(actualBuffer);
}


Handle<Value> WriteByte(const Arguments& args) {
  HandleScope scope;

  int8_t byte = args[0]->Int32Value();
  Local<Value> err = Local<Value>::New(Null());

  if (i2c_smbus_write_byte(fd, byte) == -1) {
    err = Exception::Error(String::New("Cannot write to device"));
  }

  if (args[1]->IsFunction()) {
    const unsigned argc = 1;
    Local<Function> callback = Local<Function>::Cast(args[1]);
    Local<Value> argv[argc] = { err };

    callback->Call(Context::GetCurrent()->Global(), argc, argv);
  }

  return scope.Close(Undefined());
}

Handle<Value> WriteBlock(const Arguments& args) {
  HandleScope scope;

  Local<Value> buffer = args[1];

  int8_t cmd = args[0]->Int32Value();
  int   len = node::Buffer::Length(buffer->ToObject());
  char* data = node::Buffer::Data(buffer->ToObject());

  Local<Value> err = Local<Value>::New(Null());

  if (i2c_smbus_write_i2c_block_data(fd, cmd, len, (unsigned char*) data) == -1) {
    err = Exception::Error(String::New("Cannot write to device"));
  }

  if (args[2]->IsFunction()) {
    const unsigned argc = 1;
    Local<Function> callback = Local<Function>::Cast(args[2]);
    Local<Value> argv[argc] = { err };

    callback->Call(Context::GetCurrent()->Global(), argc, argv);
  }

  return scope.Close(Undefined());
}

Handle<Value> WriteWord(const Arguments& args) {
  HandleScope scope;
  
  int8_t cmd = args[0]->Int32Value();
  int16_t word = args[1]->Int32Value();

  Local<Value> err = Local<Value>::New(Null());
  
  if (i2c_smbus_write_word_data(fd, cmd, word) == -1) {
    err = Exception::Error(String::New("Cannot write to device"));
  }

  if (args[2]->IsFunction()) {
    const unsigned argc = 1;
    Local<Function> callback = Local<Function>::Cast(args[2]);
    Local<Value> argv[argc] = { err };

    callback->Call(Context::GetCurrent()->Global(), argc, argv);
  }

  return scope.Close(Undefined());
}

void Init(Handle<Object> target) {
  target->Set(String::NewSymbol("scan"),
    FunctionTemplate::New(Scan)->GetFunction());

  target->Set(String::NewSymbol("setAddress"),
    FunctionTemplate::New(SetAddress)->GetFunction());

  target->Set(String::NewSymbol("open"),
    FunctionTemplate::New(Open)->GetFunction());

  target->Set(String::NewSymbol("close"),
    FunctionTemplate::New(Close)->GetFunction());

  target->Set(String::NewSymbol("writeByte"),
      FunctionTemplate::New(WriteByte)->GetFunction());

  target->Set(String::NewSymbol("writeBlock"),
      FunctionTemplate::New(WriteBlock)->GetFunction());

  target->Set(String::NewSymbol("readByte"),
    FunctionTemplate::New(ReadByte)->GetFunction());

  target->Set(String::NewSymbol("readBlock"),
    FunctionTemplate::New(ReadBlock)->GetFunction());

}

NODE_MODULE(i2c, Init)