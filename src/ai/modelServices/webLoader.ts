import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

const loader = new CheerioWebBaseLoader(
  "https://js.langchain.com/docs/integrations/document_loaders/web_loaders/web_cheerio/",
  {
    // optional params: ...
  }
);

const docs = await loader.load();

console.log(docs[0].metadata);
