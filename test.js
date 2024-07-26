function foo(a = 3) {
  return function doo() {
    console.log(a);
  };
}

b = foo();
b();
