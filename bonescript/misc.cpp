#include <v8.h>
#include <node.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/epoll.h>
#include <sys/types.h>

using namespace std;
using namespace node;
using namespace v8;

static Handle<Value> PollpriAsync(const Arguments&);
static int Pollpri(eio_req *);
static int PollpriAfter(eio_req *);
extern "C" void init(Handle<Object>);

struct pollpri_request {
    Persistent<Function> cb;
    char path[1];
};

static Handle<Value> PollpriAsync(const Arguments& args) {
    HandleScope scope;
    const char *usage = "usage: pollpri(path, cb)";
    if(args.Length() != 2) {
        return ThrowException(Exception::Error(String::New(usage)));
    }
    String::Utf8Value path(args[0]);
    Local<Function> cb = Local<Function>::Cast(args[1]);
    
    pollpri_request *pr = (pollpri_request *)
        malloc(sizeof(struct pollpri_request) + path.length() + 1);
        
    pr->cb = Persistent<Function>::New(cb);
    strncpy(pr->path, *path, path.length() + 1);
    
    eio_custom(Pollpri, EIO_PRI_DEFAULT, PollpriAfter, pr);
    ev_ref(EV_DEFAULT_UC);
    return(Undefined());
}

static int Pollpri(eio_req *req) {
    struct pollpri_request * pr = (struct pollpri_request *)req->data;
    return(0);
}

static int PollpriAfter(eio_req *req) {
    HandleScope scope;
    ev_unref(EV_DEFAULT_UC);
    struct pollpri_request * pr = (struct pollpri_request *)req->data;
    Local<Value> argv[2];
    argv[0] = Local<Value>::New(Null());
    argv[1] = String::New(pr->path);
    pr->cb->Call(Context::GetCurrent()->Global(), 2, argv);
    pr->cb.Dispose();
    free(pr);
}

extern "C" void init(Handle<Object> target) {
    HandleScope scope;
    NODE_SET_METHOD(target, "pollpri", PollpriAsync);
}