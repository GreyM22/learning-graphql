import {createYoga, createSchema} from 'graphql-yoga';
import {gql} from 'graphql-tag';
import {createServer} from 'http';
import { v4 as uuidv4 } from 'uuid';

const users = [
    {
        id: '1',
        name: 'Grei',
    },
    {
        id: '2',
        name: 'Ilva',
    },
    {
        id: '3',
        name: 'Erisa',
    },
];

const posts = [
    {
        id: '1',
        title: 'Post 1',
        author: '1'
    },
    {
        id: '2',
        title: 'Post 2',
        author: '1'
    },
    {
        id: '3',
        title: 'Post 3',
        author: '2'
    }
];

const comments = [
    {
        id: '1',
        text: 'Comment 1',
        post: '1',
        user: '3'
    },
    {
        id: '2',
        text: 'Comment 2',
        post: '3',
        user: '1'
    }
];

const typeDefs = gql`
    type Query {
        users(id: String): [User!]!
        post(id: String!): Post!
        posts(title: String): [Post!]!
        comments: [Comment!]!
    }
    
    type Mutation {
        createUser(name: String!): User!
        createComment(data: CreateCommentInput!): Comment!
    }
    
    input CreateCommentInput {
        text: String!
        post: ID!
        user: ID!
    }
    
    
    type User {
        id: ID!
        name: String!
        posts: [Post!]!
        comments: [Comment!]!
    }
    
    type Post {
        id: ID!
        title: String!
        author: User!
        comments: [Comment!]!
    }
    
    type Comment {
        id: ID!
        text: String!
        post: Post!
        user: User!
    }
`;

const resolvers = {
    Query: {
        users(parent, arg) {
            if (arg.id) {
                return users.filter(user => user == arg.id);
            }
            return users;
        },
        post(parent, arg) {
            return posts.filter(post => post.id == arg.id);
        },
        posts(parent, arg) {
            if (arg.title) {
                return posts.filter(post => post.title.toLowerCase().includes(arg.title.toLowerCase()));
            }
            return posts;
        },
        comments(parent) {
            return comments;
        }
    },
    Mutation: {
        createUser(parent, arg) {
            const user = {
                id: uuidv4(),
                name: arg.name
            }
            users.push(user);

            return user;
        },
        createComment(parent, args) {
            const post = posts.find(post => post.id === args.data.post);

            if (!post) {
                throw new Error('No post found with ID ' + args.data.post);
            }

            const user = users.find(user => user.id === args.data.user);

            if (!user) {
                throw new Error('No user found with ID ' + args.data.user);
            }

            const comment = {
                id:  uuidv4(),
                ...args.data
                // text: args.text,
                // post: args.post,
                // user: args.user
            };

            comments.push(comment);

            return comment;
        }
    },
    User: {
        posts(parent, args) {
            console.log(posts.filter(post => post.author == parent.id));
            return posts.filter(post => post.author == parent.id);
        },
        comments(parent, args) {
            return comments.filter(comment => comment.user == parent.id);
        }
    },
    Post: {
        author(parent, arg) {
            return users.filter(user => user.id == parent.author)[0];
        },
        comments(parent) {
            return comments.filter(comment => comment.post == parent.id);
        }
    },
    Comment: {
        post(parent) {
            return posts.filter(post => post.id == parent.post)[0];
        },
        user(parent) {
            return users.filter(user => user.id == parent.user)[0];
        }
    }
};

const server = createServer(
    createYoga({
        graphqlEndpoint: '/',
        schema: createSchema({
            typeDefs,
            resolvers
        })
    })
);

server.listen(4000, () => {
    console.log('Server is up!');
})
