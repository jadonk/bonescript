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

#define PRINTF printf

using namespace std;
using namespace node;
using namespace v8;


extern "C" void init(Handle<Object>);
static void pollpri_event(EV_P_ ev_io * req, int revents);

static void pollpri_prepare_cb(EV_P_ ev_prepare * w, int revents) {

}

#define QUOTE(name, ...) #name
#define STR(macro) QUOTE(macro)
#define TEST_EV_DEFAULT_NAME STR(EV_DEFAULT_)

class Pollpri: ObjectWrap {
private:
    int fd, epfd;
    char *path;
public:
    ev_io event_watcher, *ew;

    struct pollpri_request {
        Pollpri *p;
        Persistent<Function> cb;
    };

    static Persistent<FunctionTemplate> ct;
    
    static void Init(Handle<Object> target) {
        PRINTF("Entering Init\n");
        HandleScope scope;
        Local<FunctionTemplate> t = FunctionTemplate::New(New);
        ct = Persistent<FunctionTemplate>::New(t);
        ct->InstanceTemplate()->SetInternalFieldCount(1);
        ct->SetClassName(String::NewSymbol("Pollpri"));
    
        NODE_SET_PROTOTYPE_METHOD(ct, "pollpri", pollpri);
        NODE_SET_PROTOTYPE_METHOD(ct, "ping", ping);
        
        target->Set(String::NewSymbol("Pollpri"), ct->GetFunction());

        PRINTF("EV_DEFAULT_ = %s\n", TEST_EV_DEFAULT_NAME);
        PRINTF("Leaving Init\n");
    }
    
    Handle<Value> Emit(const Arguments& args) {
        HandleScope scope;
        
    }

    Pollpri() {
        PRINTF("Entering Pollpri constructor\n");
        epfd = 0;
        fd = 0;
        ev_init(&event_watcher, pollpri_event);
        event_watcher.data = this;
        ew = &event_watcher;
    }
    
    ~Pollpri() {
        PRINTF("Entering Pollpri destructor\n");
        if(epfd) close(epfd);
        if(fd) close(fd);
    }
    
    static Handle<Value> New(const Arguments& args) {
        PRINTF("Entered New\n");
        HandleScope scope;
        const char *usage = "usage: new Pollpri(path)";
        if(!args.IsConstructCall() || args.Length() != 1) {
            return ThrowException(Exception::Error(String::New(usage)));
        }
        String::Utf8Value path(args[0]);
        Pollpri *p = new Pollpri();
        p->Wrap(args.This());
        p->path = (char *)malloc(path.length() + 1);
        strncpy(p->path, *path, path.length() + 1);
        
        // Open file to watch
        int fd = open(p->path, O_RDWR | O_NONBLOCK);
        PRINTF("open(%s) returned %d: %s\n", p->path, fd, strerror(errno));
        
        // Create epoll event
        int epfd = epoll_create(1);
        PRINTF("epoll_create(1) returned %d: %s\n", epfd, strerror(errno));
        struct epoll_event ev;
        ev.events = EPOLLPRI;
        ev.data.fd = fd;
        int n = epoll_ctl(epfd, EPOLL_CTL_ADD, fd, &ev);
        PRINTF("epoll_ctl(%d) returned %d (%d): %s\n", fd, n, epfd, strerror(errno));
        
        // Setup event watcher
        ev_io_set(p->ew, epfd, EV_READ | EV_WRITE);
        ev_io_start(EV_DEFAULT_ p->ew);
        //struct ev_prepare * pollpri_prepare = 
        //    (struct ev_prepare *)malloc(sizeof(struct ev_prepare));
        //ev_prepare_init(pollpri_prepare, pollpri_prepare_cb);
        //ev_prepare_start(EV_DEFAULT_UC_ pollpri_prepare);
        
        p->epfd = epfd;
        p->fd = fd;        
        
        PRINTF("Leaving New\n");
        return(args.This());
    }

    static Handle<Value> pollpri(const Arguments& args) {
        PRINTF("Entered pollpri\n");
        HandleScope scope;
        const char *usage = "usage: pollpri(cb)";
        if(args.Length() != 1) {
            return ThrowException(Exception::Error(String::New(usage)));
        }
        Local<Function> cb = Local<Function>::Cast(args[0]);
        
        struct pollpri_request * pr = 
            (struct pollpri_request *)malloc(sizeof(struct pollpri_request));
        Pollpri* p = ObjectWrap::Unwrap<Pollpri>(args.This());
        
        pr->p = p;
        pr->cb = Persistent<Function>::New(cb);
        
        //eio_custom(pollpri_thread, EIO_PRI_DEFAULT, pollpri_after, pr);
        //ev_ref(EV_DEFAULT_UC);
        PRINTF("Leaving pollpri\n");
        return(Undefined());
    }
    
    static int pollpri_thread(eio_req* req) {
        PRINTF("Entered pollpri_thread\n");
        struct pollpri_request * pr = (struct pollpri_request *)req->data;
        Pollpri * p = pr->p;
        int epfd = p->epfd;
        int fd = p->fd;
        char buf[64];
        
        // Wait for epoll events
        if(epfd) {
            int m = 0;
            m = lseek(fd, 0, SEEK_SET);
            PRINTF("seek(%d) %d bytes: %s\n", fd, m, strerror(errno));
            m = read(fd, &buf, 63);
            buf[m] = 0;
            PRINTF("read(%d) %d bytes (%s): %s\n", fd, m, buf, strerror(errno));
        
            // Wait for epoll event
            //struct epoll_event events;
            //PRINTF("Calling epoll_wait\n");
            //m = epoll_wait(epfd, &events, 1, -1);
            //PRINTF("epoll_wait(%d) returned %d: %s\n", epfd, m, strerror(errno));
            
            // Wait for poll event
            //struct pollfd pfd;
            //pfd.fd = fd;
            //pfd.events = POLLPRI;
            //m = poll(&fdset, 1, -1)        
        }
        
        //close(epfd);
        //close(fd);
        PRINTF("Leaving pollpri_thread\n");
        return(0);
    }
    
    static int pollpri_after(eio_req* req) {
        PRINTF("Entered pollpri_after\n");
        HandleScope scope;
        ev_unref(EV_DEFAULT_UC);
        struct pollpri_request * pr = (struct pollpri_request *)req->data;
        Local<Value> argv[2];
        argv[0] = Local<Value>::New(Null());
        argv[1] = String::New(pr->p->path);
        pr->cb->Call(Context::GetCurrent()->Global(), 2, argv);
        pr->cb.Dispose();
        free(pr);
        PRINTF("Leaving pollpri_after\n");
        return(0);
    }

    void Event(Pollpri * p, int revents) {
        HandleScope scope;
        PRINTF("fd = %d, epfd = %d\n", fd, epfd);
        if(revents & EV_ERROR) {
            PRINTF("EV_ERROR\n");
            return;
        }
        if(revents & EV_READ) {
            PRINTF("EV_READ\n");
        }
        if(revents & EV_WRITE) {
            PRINTF("EV_WRITE\n");
        }
        
#if 0
        int m = 0;
        char buf[64];
        m = lseek(p->fd, 0, SEEK_SET);
        PRINTF("seek(%d) %d bytes: %s\n", p->fd, m, strerror(errno));
        m = read(p->fd, &buf, 63);
        buf[m] = 0;
        PRINTF("read(%d) %d bytes (%s): %s\n", p->fd, m, buf, strerror(errno));
#endif
        char * buf = "0\n";

        Local<Value> emit_v = handle_->Get(String::NewSymbol("emit"));
        assert(emit_v->IsFunction());
        Local<Function> emit_f = emit_v.As<Function>();
        
        Handle<Value> argv[2];
        argv[0] = String::New("ping");
        argv[1] = String::New(buf);
        
        TryCatch tc;
        
        emit_f->Call(handle_, 2, argv);

        if(tc.HasCaught()) {
            FatalException(tc);
        }
    }
    
    static Handle<Value> ping(const Arguments& args) {
        HandleScope scope;
        Pollpri* p = ObjectWrap::Unwrap<Pollpri>(args.This());
        
        int m = 0;
        char buf[64];
        m = lseek(p->fd, 0, SEEK_SET);
        PRINTF("seek(%d) %d bytes: %s\n", p->fd, m, strerror(errno));
        m = read(p->fd, &buf, 63);
        buf[m] = 0;
        PRINTF("read(%d) %d bytes (%s): %s\n", p->fd, m, buf, strerror(errno));
        
        Local<Value> emit_v = args.This()->Get(String::NewSymbol("emit"));
        assert(emit_v->IsFunction());
        Local<Function> emit_f = emit_v.As<Function>();
        
        Handle<Value> argv[2];
        argv[0] = String::New("ping");
        argv[1] = String::New(buf);
        
        TryCatch tc;
        
        emit_f->Call(args.This(), 2, argv);

        if(tc.HasCaught()) {
            FatalException(tc);
        }
        
        return(Undefined());
    }

    static void pollpri_event(EV_P_ ev_io * req, int revents) {
        PRINTF("Entered pollpri_event\n");
        Pollpri *p = static_cast<Pollpri*>(req->data);
        p->Event(p, revents);
        PRINTF("Leaving pollpri_event\n");
    }
};

Persistent<FunctionTemplate> Pollpri::ct;

extern "C" {
    void init(Handle<Object> target) {
        PRINTF("Calling Init\n");
        Pollpri::Init(target);
    }
    
    NODE_MODULE(pollpri, init);
}