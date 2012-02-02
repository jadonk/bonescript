#include <stdio.h>
#include <stdlib.h>

int main (int argc, char **argv) {
    int i = atoi(argv[1]);
    printf("%f\n", *(float *) &i);
}
