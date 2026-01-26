import { gql } from "apollo-server";

// This is the "Schema" - the blueprint of your API.
// "Query" defines what data users can ASK for.
// "Mutation" defines what changes users can MAKE (add, delete).

export const typeDefs = gql`
  type Query {
    welcomeMessage: String
  }
`;