#include <stdio.h>

#ifndef CALC_TRACE
#define CALC_TRACE 0
#endif

int calc_add(int a, int b)
{
#if CALC_TRACE
    printf("[calc] add(%d, %d)\n", a, b);
#endif
    return a + b;
}

int main(void)
{
    printf("2 + 3 = %d\n", calc_add(2, 3));
    return 0;
}
