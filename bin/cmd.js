#!/usr/bin/env node
require("../lib/cli").start().then(() => {
    console.log("Success");
}).catch(error => {
    console.error(error);
});
