import 'dotenv/config';
import {scrapeByKeyword} from "@/scrapper/scrapeByKeyword.js";

const results = await scrapeByKeyword('rtx 3080');
console.log(results);