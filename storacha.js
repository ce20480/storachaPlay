import "dotenv/config";
import { filesFromPaths } from "files-from-path";

const UCAN = process.env.UCAN;
const DID_KEY = process.env.DID_KEY;
const EMAIL = process.env.EMAIL;

const files = await filesFromPaths(["./y_test.csv"]);

import * as Client from "@web3-storage/w3up-client";
import { StoreMemory } from "@web3-storage/w3up-client/stores/memory";
import * as Proof from "@web3-storage/w3up-client/proof";
import { Signer } from "@web3-storage/w3up-client/principal/ed25519";
import * as DID from "@ipld/dag-ucan/did";

async function backend(did) {
  // Load client with specific private key
  const principal = Signer.parse(UCAN);
  const store = new StoreMemory();
  const client = await Client.create({ principal, store });

  // Add proof that this agent has been delegated capabilities on the space
  // const proof = await Proof.parse(process.env.PROOF);
  // const space = await client.addSpace(proof);
  await client.setCurrentSpace(space.did());

  // Create a delegation for a specific DID
  const audience = DID.parse(did);
  const abilities = [
    "space/blob/add",
    "space/index/add",
    "filecoin/offer",
    "upload/add",
  ];
  const expiration = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24 hours from now
  const delegation = await client.createDelegation(audience, abilities, {
    expiration,
  });

  // Serialize the delegation and send it to the client
  const archive = await delegation.archive();
  return archive.ok;
}

// const respose = backend(DID_KEY);

const client = await Client.create();
const account = await client.login(EMAIL);
const space = await client.createSpace("my-awesome-space", { account });
await client.setCurrentSpace(space.did());
// const space = await client.setCurrentSpace(DID_KEY);
//
const directoryCID = await client.uploadDirectory(files);
console.log(directoryCID);
