/*
* createpair: A node.js module that allows creating exec surviving file descriptors.
*
* Copyright 2011 (c) <sander at tolsma.net>
*
* Under MIT License. See LICENSE file.
*
*/

#include <v8.h>
#include <node.h>
#include <sys/stat.h>
#include <string.h>
#include <stdlib.h>
#include <errno.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/types.h>

#include <sys/socket.h> /* socketpair */
#include <sys/un.h>


using namespace v8;
using namespace node;

#define FD_ARG(a)                                        \
  int fd;                                                \
  if (!(a)->IsInt32() || (fd = (a)->Int32Value()) < 0) { \
    return ThrowException(Exception::TypeError(          \
          String::New("Bad file descriptor argument"))); \
  }

static Handle<Value> Close(const Arguments& args) {
  HandleScope scope;

  FD_ARG(args[0])

  // Windows: this is not a winsock operation, don't use _get_osfhandle here!
  if (0 > close(fd)) {
    return ThrowException(ErrnoException(errno, "close"));
  }

  return Undefined();
}

static inline int SetNonBlocking(int fd) {
  int flags = fcntl(fd, F_GETFL, 0);
  int r = fcntl(fd, F_SETFL, flags | O_NONBLOCK);
  if (r != 0) {
    perror("SetNonBlocking()");
  }
  return r;
}


// Creates nonblocking socket pair
static Handle<Value> CreatePair(const Arguments& args) {
  HandleScope scope;

  int fds[2];

  if (socketpair(AF_UNIX, SOCK_STREAM, 0, fds) < 0) {
    return ThrowException(ErrnoException(errno, "socketpair"));
  }

  SetNonBlocking(fds[0]);
  SetNonBlocking(fds[1]);

  Local<Array> a = Array::New(2);
  a->Set(Integer::New(0), Integer::New(fds[0]));
  a->Set(Integer::New(1), Integer::New(fds[1]));
  return scope.Close(a);
}

//
// Initialize this add-on
//
extern "C" void init(Handle<Object> target) {
  HandleScope scope;
  
  NODE_SET_METHOD(target, "createpair", CreatePair);
  NODE_SET_METHOD(target, "close", Close);
}