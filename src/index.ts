import { ApolloServer } from "apollo-server";
import { DateTimeResolver } from "graphql-scalars";
import { Context, context } from "./context";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

const typeDefs = `
type Query {
  allUsers: [User!]!
  postById(id: Int!): Post
  feed(searchString: String, skip: Int, take: Int): [Post!]!
  draftsByUser(id: Int!): [Post]
}

type Mutation {
  signupUser(name: String, email: String!): User!
  createDraft(title: String!, content: String, authorEmail: String): Post
  incrementPostViewCount(id: Int!): Post
  deletePost(id: Int!): Post
}

type User {
  id: Int!
  email: String!
  name: String
  posts: [Post!]!
}

type Post {
  id: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
  title: String!
  content: String
  published: Boolean!
  viewCount: Int!
  author: User
}

scalar DateTime
`;

const resolvers = {
  Query: {
    allUsers: (_parent, _args, { prisma }: Context) => {
      return prisma.user.findMany();
    },
    postById: (_parent, { id }: { id: number }, { prisma }: Context) => {
      return prisma.post.findUnique({
        where: {
          id,
        },
      });
    },
    feed: (
      _parent,
      {
        searchString,
        skip,
        take,
      }: {
        searchString: string | undefined;
        skip: number | undefined;
        take: number | undefined;
      },
      { prisma }: Context
    ) => {
      const OR = searchString
        ? {
            OR: [
              { title: { contains: searchString } },
              { content: { contains: searchString } },
            ],
          }
        : {};
      return prisma.post.findMany({
        skip,
        take,
        where: {
          published: true,
          ...OR,
        },
      });
    },
    draftsByUser: (_parent, { id }: { id: number }, { prisma }: Context) => {
      return prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          posts: {
            where: {
              published: false,
            },
          },
        },
      });
    },
  },
  Mutation: {
    signupUser: (
      _parent,
      { email, name }: { name: string | undefined; email: string },
      { prisma }: Context
    ) => {
      return prisma.user.create({
        data: {
          email,
          name,
        },
      });
    },
    createDraft: (
      _parent,
      {
        title,
        content,
        authorEmail,
      }: { title: string; content: string | undefined; authorEmail: string },
      { prisma }: Context
    ) => {
      return prisma.post.create({
        data: {
          title,
          content,
          author: {
            connect: {
              email: authorEmail,
            },
          },
        },
      });
    },
    incrementPostViewCount: (
      _parent,
      { id }: { id: number },
      { prisma }: Context
    ) => {
      return prisma.post.update({
        where: {
          id,
        },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });
    },
    deletePost: (_parent, { id }: { id: number }, { prisma }: Context) => {
      return prisma.post.delete({ where: { id } });
    },
  },
  Post: {
    author: (parent, _args, { prisma }: Context) => {
      return prisma.post
        .findUnique({
          where: {
            id: parent.id,
          },
        })
        .author();
    },
  },
  User: {
    posts: (parent, _args, { prisma }: Context) => {
      return prisma.user
        .findUnique({
          where: { id: parent.id },
        })
        .posts();
    },
  },
  DateTime: DateTimeResolver,
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});
server.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at: http://localhost:4000`)
);
