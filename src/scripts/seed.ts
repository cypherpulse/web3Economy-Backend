import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config';
import { Admin, Event, Creator, BuilderProject, Resource } from '../models';

const seedData = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to database
    await connectDatabase();

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      Admin.deleteMany({}),
      Event.deleteMany({}),
      Creator.deleteMany({}),
      BuilderProject.deleteMany({}),
      Resource.deleteMany({}),
    ]);

    // Create admin user
    console.log('Creating admin user...');
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('Admin123!', salt);

    await Admin.create({
      email: 'admin@web3economy.com',
      passwordHash,
      name: 'Admin User',
      role: 'superadmin',
    });

    // Create sample events
    console.log('Creating sample events...');
    await Event.insertMany([
      {
        title: 'Web3 Summit 2025',
        date: 'March 15-17, 2025',
        location: 'San Francisco, CA',
        attendees: 5000,
        description: 'The premier conference for Web3 developers and entrepreneurs. Join us for three days of talks, workshops, and networking.',
        type: 'Conference',
        price: '$299',
        status: 'upcoming',
        bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        registrationUrl: 'https://web3summit.example.com',
      },
      {
        title: 'DeFi Workshop',
        date: 'February 20, 2025',
        location: 'Online',
        attendees: 500,
        description: 'Learn how to build decentralized finance applications from scratch.',
        type: 'Workshop',
        price: 'Free',
        status: 'upcoming',
        bannerImage: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
      },
      {
        title: 'NFT Hackathon',
        date: 'April 5-7, 2025',
        location: 'Miami, FL',
        attendees: 300,
        description: 'Build the next generation of NFT applications in 48 hours.',
        type: 'Hackathon',
        price: 'Free',
        status: 'upcoming',
        bannerImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
      },
    ]);

    // Create sample creators
    console.log('Creating sample creators...');
    await Creator.insertMany([
      {
        name: 'Alex Thompson',
        bio: 'Full-stack Web3 developer and educator. Building the decentralized future one block at a time.',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        socialMedia: [
          { platform: 'twitter', url: 'https://twitter.com/alexthompson' },
          { platform: 'github', url: 'https://github.com/alexthompson' },
        ],
        creatorCoin: {
          symbol: 'ALEX',
          marketCap: 250000,
          price: 2.5,
          change24h: 5.2,
        },
        followers: '12.5K',
      },
      {
        name: 'Sarah Chen',
        bio: 'DeFi researcher and smart contract auditor. Passionate about blockchain security.',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        socialMedia: [
          { platform: 'twitter', url: 'https://twitter.com/sarahchen' },
          { platform: 'linkedin', url: 'https://linkedin.com/in/sarahchen' },
        ],
        creatorCoin: {
          symbol: 'SARAH',
          marketCap: 180000,
          price: 1.8,
          change24h: -2.1,
        },
        followers: '8.3K',
      },
    ]);

    // Create sample builder projects
    console.log('Creating sample builder projects...');
    await BuilderProject.insertMany([
      {
        title: 'DefiSwap',
        creator: 'Alex Thompson',
        description: 'A decentralized exchange built on Ethereum with advanced AMM features.',
        tech: ['Solidity', 'React', 'Hardhat', 'The Graph'],
        status: 'Live',
        users: '50K+',
        tvl: '$25M',
        image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
        githubUrl: 'https://github.com/example/defiswap',
        socialMedia: [
          { platform: 'twitter', url: 'https://twitter.com/defiswap' },
          { platform: 'discord', url: 'https://discord.gg/defiswap' },
        ],
        websiteUrl: 'https://defiswap.example.com',
      },
      {
        title: 'NFTMarket',
        creator: 'Sarah Chen',
        description: 'An open NFT marketplace with creator royalties and cross-chain support.',
        tech: ['Solidity', 'Next.js', 'IPFS', 'Polygon'],
        status: 'Beta',
        users: '10K+',
        tvl: '$5M',
        image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800',
        githubUrl: 'https://github.com/example/nftmarket',
        socialMedia: [
          { platform: 'twitter', url: 'https://twitter.com/nftmarket' },
        ],
      },
    ]);

    // Create sample resources
    console.log('Creating sample resources...');
    await Resource.insertMany([
      {
        title: 'Introduction to Solidity',
        description: 'Learn the fundamentals of Solidity programming language for Ethereum smart contracts.',
        type: 'Tutorial',
        category: 'Smart Contracts',
        level: 'Beginner',
        duration: '2 hours',
        author: 'Alex Thompson',
        downloads: 1520,
        rating: 4.8,
        students: 3500,
        image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
        resourceUrl: 'https://example.com/solidity-intro',
        provider: 'Web3 Economy Team',
        tags: ['Solidity', 'Ethereum', 'Smart Contracts', 'Beginner'],
        slug: 'introduction-to-solidity',
        featured: true,
      },
      {
        title: 'DeFi Deep Dive',
        description: 'Comprehensive guide to understanding and building decentralized finance protocols.',
        type: 'Documentation',
        category: 'DeFi',
        level: 'Advanced',
        duration: '5 hours',
        author: 'Sarah Chen',
        downloads: 890,
        rating: 4.9,
        students: 1200,
        image: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800',
        resourceUrl: 'https://example.com/defi-deep-dive',
        provider: 'Web3 Economy Team',
        tags: ['DeFi', 'Liquidity Pools', 'AMM', 'Advanced'],
        slug: 'defi-deep-dive',
        featured: true,
      },
      {
        title: 'Web3.js Fundamentals',
        description: 'Master the Web3.js library for interacting with Ethereum blockchain.',
        type: 'Video',
        category: 'Development',
        level: 'Intermediate',
        duration: '3 hours',
        author: 'Web3 Academy',
        downloads: 2100,
        rating: 4.7,
        students: 4500,
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        resourceUrl: 'https://example.com/web3js-fundamentals',
        provider: 'Web3 Academy',
        tags: ['Web3.js', 'JavaScript', 'Ethereum', 'Development'],
        slug: 'web3js-fundamentals',
        featured: false,
      },
    ]);

    console.log('✅ Database seeded successfully!');
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin Credentials:
  Email:    admin@web3economy.com
  Password: Admin123!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

seedData();
