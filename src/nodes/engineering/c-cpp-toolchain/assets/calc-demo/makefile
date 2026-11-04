CC = gcc
CPPFLAGS = -Iinclude -DCALC_TRACE=0
CFLAGS = -std=c17 -Wall -Wextra -Wpedantic -O0

all: build-make/calc-demo

build-make/calc-demo: build-make/main.o build-make/libcalc.a
	$(CC) build-make/main.o build-make/libcalc.a -o build-make/calc-demo

build-make/libcalc.a: build-make/calc.o
	ar rcs build-make/libcalc.a build-make/calc.o

build-make/main.o: src/main.c include/calc.h | build-make
	$(CC) $(CPPFLAGS) $(CFLAGS) -c src/main.c -o build-make/main.o

build-make/calc.o: src/calc.c include/calc.h | build-make
	$(CC) $(CPPFLAGS) $(CFLAGS) -c src/calc.c -o build-make/calc.o

build-make:
	mkdir -p build-make

.PHONY: all
