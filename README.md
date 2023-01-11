# Verified IPFS retrieval in the browser

Demonstrating how to do verified (aka trustless) retrieval in the browser by fetching a [CAR file](https://ipld.io/specs/transport/car/carv1/) from an IPFS HTTP gateway.

Note that _verified_ and _trustless_ are used in this context synonymously.

## Why?

When fetching a CID from a gateway, you are typically trusting the gateway to return you the correct response.

To eliminate the need to trust gateways, you can ask for a CAR response which allows you to verify that the input CID you request matches the CID of the response.

## What's a CAR file?

The CAR file format (Content Addressable aRchives) is binary serialisation of content addressed data (like UnixFS files and IPLD blocks). Typically these are stored in a file with the `.car` extension

CAR files are useful for several reasons:

- Allow moving content addressed data using any transport, e.g. HTTP in the case of trustless gateways
- Ensure that the CID is the consistent for the same input data. If you may remember, when files are added to IPFS, choosing different paramters will yield a different CID.

![car file](https://ipld.io/specs/transport/car/content-addressable-archives.png)

## How it works

Using [trustless gateways](https://github.com/ipfs/specs/blob/main/http-gateways/TRUSTLESS_GATEWAY.md), a CAR file for the CID is requested with the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

The response stream is piped into a [`CarReader`](https://github.com/ipld/js-car#carreader), which traverses the DAG and constructs the file from the binary chucks. While the DAG is constructed, the blocks are verified by calculating a hash for each block and comparing it against the block.
