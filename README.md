

#Purpose

The primary purpose, originally, was to have something to work on to figure out "monorepo architecture," and getting the hang of using code generation AI.  

My experience in coding with Generative AI tools like Bolt.new and Cursor and Warp, was that these Code Generators don't have a good memory of the entire codebase, and on your work history together.  So, they are prone to rewrite code you like and want to keep while working on something else entirely. It creates a need for the developer to isolate contexts for the Code Generator AI to work in. 

If I've invited you to collaborate on this (Tanuj), use it as a playground for AI Code Gen, and pay attention to "monorepo architecture" with microservices and microfrontends. 

But, since I've come this far.... 

### A citation manager, formatted link generator that's Obsidian friendly. 
Obsidian has quickly become the "markdown editor" and "knowledge base" notebook. It's tough to explain, you just have to get used to it. In many ways it's super powerful and is likely the best default note-taking, docs-making, web-publishing platform.  In many other ways, it's super frustrating. Just when you get excited to do something, you find another quirk or limitation.

#### *For Instance*: 
- Foototes have the syntax `[^1] whatever you want here` when you embed it in your text, and then `[^1]: whatever you want here` when you call it in the footnote section.  As long as the two numbers match in the two respective places, the footnotes will "reorder" upon reading or publishing or exporting. Trying to keep up with the numbers when you move text around is a bitch, though. So, here I have a little button that changes it into a randomly generated hexidecimal string. 
- YouTube embeds usually are not responsive and include all the YouTube controls. Doesn't work right in Obsidian docs. This autogenerates an iframe that's responsive and strips the controls. 

And, it's open source and has a small team. So, they're not going to get around to doing a lot -- instead they have "plugins" and a "developer community" all of which is pretty active. So, this is something a lot of the "community" would get excited about.   

Citations in Obsidian are both clever and way too dumb for large scale publications. Even for a college student, students would quickly run to mommy and get Endnote or Zotero or Citelighter or whatever they are using these days. 

# General architecture:
- Right now the ui is all in apps/web.
- The backend is in packages/backend. 

To be honest, I had wanted each main feature group to get it's own "microfrontend" but I'm not sure this is going to be big enough of an app to have that make sense. 

# Getting Started 
### Prerequisites

- Node.js (v20 or later)
- pnpm (v10 or later)
- Docker and Docker Compose (for running the database and services)
- A Google Developer API key that works for YouTube and Google Books. 

### Initial Setup

1. Make sure you have the latest Docker installed, and I recommend getting Docker Desktop. It's free. 

### Run from Docker

`docker-compose build`

# Start the services
`docker-compose up`


### if you need to remove node_modules and start over:
`pnpm -r exec -- rm -rf node_modules`