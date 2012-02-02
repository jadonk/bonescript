#include <stdio.h>
#include <stdlib.h>

int main (int argc, char **argv) {
    float f = atof(argv[1]);
    printf("%i\n", *(int *) &f);
}
