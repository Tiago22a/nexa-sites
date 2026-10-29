#!/usr/bin/env node
// Execute localmente: node scripts/nexa-admin-hash.mjs "SENHA-FORTE"
import {randomBytes,scryptSync} from "node:crypto";
const password=process.argv.slice(2).join(" ");
if(password.length<14){console.error("Use uma senha com pelo menos 14 caracteres.");process.exit(1)}
const salt=randomBytes(24).toString("hex");
console.log(salt+":"+scryptSync(password,Buffer.from(salt,"hex"),64).toString("hex"));
