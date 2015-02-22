#Twitter streams using node, redis, pubsub and sse

##Streamer app

This app subscribes to `stream.score_updates` and keeps a connection pool of clients to whom it broadcasts new data.

#Considerations

The code by now means must be considered production ready. It is just an idea and a proof of concept. I can be improved quite a great deal.

#TODO

- [ ] better docs on how to run
- [ ] better code, clean shit up
- [ ] demo
