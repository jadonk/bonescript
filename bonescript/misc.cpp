#include <v8.h>
#include <node.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/epoll.h>
#include <sys/types.h>
#include <stdio.h>
#include <errno.h>

using namespace std;
using namespace node;
using namespace v8;

extern "C" void pollpri_event(ev_io* req, int revents);
extern "C" void init(Handle<Object>);

class Pollpri: ObjectWrap {
private:
    int fd, epfd;
    char *path;
public:
    struct pollpri_request {
        Pollpri *p;
        Persistent<Function> cb;
    };

    static Persistent<FunctionTemplate> ct;
    
    static void Init(Handle<Object> target) {
        HandleScope scope;
        Local<FunctionTemplate> t = FunctionTemplate::New(New);
        ct = Persistent<FunctionTemplate>::New(t);
        ct->InstanceTemplate()->SetInternalFieldCount(1);
        ct->SetClassName(String::NewSymbol("Pollpri"));
    
        NODE_SET_PROTOTYPE_METHOD(ct, "pollpri", pollpri);
        
        target->Set(String::NewSymbol("Pollpri"), ct->GetFunction());
    }

    Pollpri() {
        epfd = 0;
        fd = 0;
    }
    
    ~Pollpri() {
        if(epfd) close(epfd);
        if(fd) close(fd);
    }
    
    static Handle<Value> New(const Arguments &args) {
        printf("Entered New\n");
        HandleScope scope;
        const char *usage = "usage: new Pollpri(path)";
        if(args.Length() != 1) {
            return ThrowException(Exception::Error(String::New(usage)));
        }
        String::Utf8Value path(args[0]);
        Pollpri *p = new Pollpri();
        p->Wrap(args.This());
        p->path = (char *)malloc(path.length() + 1);
        strncpy(p->path, *path, path.length() + 1);
        printf("Leaving New\n");
        return(args.This());
    }

    static Handle<Value> pollpri(const Arguments& args) {
        printf("Entered pollpri\n");
        HandleScope scope;
        const char *usage = "usage: pollpri(cb)";
        if(args.Length() != 1) {
            return ThrowException(Exception::Error(String::New(usage)));
        }
        Local<Function> cb = Local<Function>::Cast(args[0]);
        
        pollpri_request* pr = 
            (pollpri_request *)malloc(sizeof(struct pollpri_request));
        Pollpri* p = ObjectWrap::Unwrap<Pollpri>(args.This());
        
        pr->p = p;
        pr->cb = Persistent<Function>::New(cb);
        
        eio_custom(pollpri_thread, EIO_PRI_DEFAULT, pollpri_after, pr);
        ev_ref(EV_DEFAULT_UC);
        printf("Leaving pollpri\n");
        return(Undefined());
    }
    
    static int pollpri_thread(eio_req *req) {
        printf("Entered pollpri_thread\n");
        struct pollpri_request * pr = (struct pollpri_request *)req->data;
        Pollpri *p = pr->p;
        int epfd = p->epfd;
        int fd = p->fd;
        if(!fd) {
            fd = open(p->path, O_RDWR | O_NONBLOCK);
            pr->p->fd = fd;
            printf("open(%s) returned %d: %s\n", p->path, fd, strerror(errno));
        }
        if(!epfd) {
            epfd = epoll_create(1);
            pr->p->epfd = epfd;
            printf("epoll_create(1) returned %d: %s\n", epfd, strerror(errno));
            struct epoll_event ev;
            ev.events = EPOLLPRI;
            ev.data.fd = fd;
            int n = epoll_ctl(epfd, EPOLL_CTL_ADD, fd, &ev);
            printf("epoll_ctl(%d) returned %d (%d): %s\n", fd, n, epfd, strerror(errno));
        }
        //ev_io pollpri_watcher;
        //ev_init(&pollpri_watcher, pollpri_event);
        //pollpri_watcher.data = pr;
        //ev_io_set(&pollpri_watcher, epfd, EV_READ | EV_WRITE);
        //ev_io_start(EV_DEFAULT_ &pollpri_watcher);
        struct epoll_event events;
        printf("Calling epoll_wait\n");
        sleep(1);
        int m = epoll_wait(epfd, &events, 1, -1);
        printf("epoll_wait(%d) returned %d: %s\n", epfd, m, strerror(errno));
        //close(epfd);
        //close(fd);
        printf("Leaving pollpri_thread\n");
        return(0);
    }
    
    static int pollpri_after(eio_req *req) {
        printf("Entered pollpri_after\n");
        HandleScope scope;
        ev_unref(EV_DEFAULT_UC);
        struct pollpri_request * pr = (struct pollpri_request *)req->data;
        Local<Value> argv[2];
        argv[0] = Local<Value>::New(Null());
        argv[1] = String::New(pr->p->path);
        pr->cb->Call(Context::GetCurrent()->Global(), 2, argv);
        pr->cb.Dispose();
        //close(pr->p->epfd);
        //close(pr->p->fd);
        free(pr);
        printf("Leaving pollpri_after\n");
        return(0);
    }
    
};

Persistent<FunctionTemplate> Pollpri::ct;

extern "C" {
    void init(Handle<Object> target) {
        Pollpri::Init(target);
    }
    
    void pollpri_event(ev_io* req, int revents) {
        printf("Entered pollpri_event\n");
        printf("Leaving pollpri_event\n");
    }
    
    NODE_MODULE(pollpri, init);
}