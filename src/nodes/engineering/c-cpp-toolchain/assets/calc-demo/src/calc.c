#include "calc.h"
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
