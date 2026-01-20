import { gql } from "graphql-tag"

export const typeDefs = gql`
    enum EatsService {
        DELIVERY
        PICK_UP
        PAYMENT
    }

    input RegisterInput {
        name: String!
        email: String!
        mobile: String!
        postcode: String!
        services: [EatsService!]!
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

    input Pagination {
        page: Int
    }

    type Query {
        leads(filter: LeadFilter,pagination:Pagination): [Lead!]!
        lead(id: ID!): Lead
    }

    type Mutation {
        register(input: RegisterInput!): Lead!
    }
`
