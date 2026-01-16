import {gql} from 'graphql-tag'

export const typeDefs = gql`
  enum EatsService {
    DELIVERY
    PICK_UP
    PAYMENT
  }

  type Lead {
    id: ID!
    name: String!
    email: String!
    mobile: String!
    postcode: String!
    services: [EatsService!]!
    createdAt: String!
  }
  
  input LeadFilter {
    email: String
    postcode: String
  }

  type Query {
    leads(filter: LeadFilter): [Lead!]!
    lead(id: ID!): Lead
  }
`
