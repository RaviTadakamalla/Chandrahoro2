/**
 * ChandraHoro V2.1 - Database Seed Script
 * 
 * Seeds the database with initial data for development and testing:
 * - Test users with different plan types
 * - Sample birth charts
 * - Default entitlements
 * - Sample readings
 * 
 * Run with: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for test users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create test users with different plan types
  const testUsers = [
    {
      email: 'test@chandrahoro.com',
      name: 'Test User',
      planType: 'free',
    },
    {
      email: 'pro@chandrahoro.com',
      name: 'Pro User',
      planType: 'pro',
    },
    {
      email: 'admin@chandrahoro.com',
      name: 'Admin User',
      planType: 'enterprise',
    },
  ];

  for (const userData of testUsers) {
    console.log(`Creating user: ${userData.email}`);
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        emailVerified: new Date(),
        
        // Create profile
        profile: {
          create: {
            fullName: userData.name,
            language: 'en',
            theme: 'auto',
            tonePreference: 'practical',
            timezone: 'Asia/Kolkata',
            onboardingCompleted: true,
            notificationPreferences: {
              daily_reading: true,
              transit_alerts: true,
              email_notifications: true,
            },
          },
        },
        
        // Create entitlement based on plan type
        entitlement: {
          create: {
            planType: userData.planType,
            planStatus: 'active',
            aiEnabled: true,
            dailyRequestLimit: userData.planType === 'free' ? 10 : userData.planType === 'pro' ? 100 : 1000,
            dailyTokenLimit: userData.planType === 'free' ? 50000 : userData.planType === 'pro' ? 500000 : 5000000,
            quotaResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            allowedModels: userData.planType === 'free' 
              ? ['claude-3-haiku-20240307']
              : ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229'],
            allowedFeatures: {
              daily_reading: true,
              ai_chat: true,
              compatibility: userData.planType !== 'free',
              pdf_reports: userData.planType === 'pro' || userData.planType === 'enterprise',
              unlimited_charts: userData.planType !== 'free',
            },
            rateLimitPerHour: userData.planType === 'free' ? 100 : 1000,
            rateLimitPerMinute: userData.planType === 'free' ? 10 : 100,
          },
        },
      },
      include: {
        profile: true,
        entitlement: true,
      },
    });

    // Create sample birth chart for the first user
    if (userData.email === 'test@chandrahoro.com') {
      console.log('Creating sample birth chart...');
      
      // Check if primary chart exists
      const existingChart = await prisma.birthChart.findFirst({
        where: {
          userId: user.id,
          isPrimary: true,
        },
      });

      if (!existingChart) {
        await prisma.birthChart.create({
        data: {
          userId: user.id,
          birthDate: new Date('1990-01-15'),
          birthTime: '14:30:00',
          birthPlace: 'Hyderabad, Telangana, India',
          latitude: 17.3850,
          longitude: 78.4867,
          timezone: 'Asia/Kolkata',
          ascendant: 'Gemini',
          sunSign: 'Capricorn',
          moonSign: 'Virgo',
          chartStyle: 'north_indian',
          houseSystem: 'whole_sign',
          ayanamsa: 'lahiri',
          isPrimary: true,
          chartName: 'My Birth Chart',
          
          // Sample planet positions (simplified)
          planets: {
            Sun: { sign: 'Capricorn', degree: 25.5, house: 8 },
            Moon: { sign: 'Virgo', degree: 12.3, house: 4 },
            Mars: { sign: 'Sagittarius', degree: 8.7, house: 7 },
            Mercury: { sign: 'Capricorn', degree: 15.2, house: 8 },
            Jupiter: { sign: 'Gemini', degree: 22.1, house: 1 },
            Venus: { sign: 'Aquarius', degree: 3.4, house: 9 },
            Saturn: { sign: 'Capricorn', degree: 18.9, house: 8 },
            Rahu: { sign: 'Aquarius', degree: 28.6, house: 9 },
            Ketu: { sign: 'Leo', degree: 28.6, house: 3 },
          },
          
          // Sample house cusps
          houses: {
            1: { sign: 'Gemini', degree: 15.0 },
            2: { sign: 'Cancer', degree: 15.0 },
            3: { sign: 'Leo', degree: 15.0 },
            4: { sign: 'Virgo', degree: 15.0 },
            5: { sign: 'Libra', degree: 15.0 },
            6: { sign: 'Scorpio', degree: 15.0 },
            7: { sign: 'Sagittarius', degree: 15.0 },
            8: { sign: 'Capricorn', degree: 15.0 },
            9: { sign: 'Aquarius', degree: 15.0 },
            10: { sign: 'Pisces', degree: 15.0 },
            11: { sign: 'Aries', degree: 15.0 },
            12: { sign: 'Taurus', degree: 15.0 },
          },
          
          // Sample aspects
          aspects: [
            { from: 'Sun', to: 'Moon', type: 'trine', strength: 0.8, benefic: true },
            { from: 'Mars', to: 'Saturn', type: 'square', strength: 0.6, benefic: false },
          ],
          
          // Sample current dasha
          currentDasha: {
            mahadasha: { planet: 'Jupiter', start: '2020-01-15', end: '2036-01-15' },
            antardasha: { planet: 'Saturn', start: '2023-05-15', end: '2026-01-15' },
            pratyantardasha: { planet: 'Mercury', start: '2024-10-15', end: '2025-03-15' },
          },
          
          // Sample dasha timeline (simplified)
          dashaTimeline: [
            { planet: 'Jupiter', start: '2020-01-15', end: '2036-01-15', level: 'mahadasha' },
            { planet: 'Saturn', start: '2036-01-15', end: '2055-01-15', level: 'mahadasha' },
            { planet: 'Mercury', start: '2055-01-15', end: '2072-01-15', level: 'mahadasha' },
          ],
        }});
      }

      // Create sample daily reading
      console.log('Creating sample reading...');
      
      await prisma.reading.create({
        data: {
          userId: user.id,
          readingType: 'daily',
          readingDate: new Date(),
          title: 'Your Daily Cosmic Guidance',
          summary: 'Today brings opportunities for growth and introspection. Jupiter\'s influence encourages expansion in career matters.',
          content: {
            overview: 'The planetary alignments today favor practical decisions and long-term planning.',
            keyThemes: ['Growth', 'Stability', 'Communication'],
            recommendations: [
              'Focus on career-related communications',
              'Avoid major financial decisions',
              'Practice meditation in the evening',
            ],
          },
          highlights: [
            'Favorable time for career discussions',
            'Good day for learning new skills',
            'Evening hours are auspicious',
          ],
          workReading: 'Your professional life receives a boost from Jupiter\'s benefic aspect. Consider proposing new ideas to your team.',
          loveReading: 'Venus in a harmonious position suggests pleasant interactions with loved ones. Express your feelings openly.',
          healthReading: 'Pay attention to your digestive health. Light meals and herbal teas are recommended.',
          financeReading: 'Avoid impulsive purchases today. Focus on long-term financial planning instead.',
          auspiciousTimings: [
            { activity: 'Important meetings', time: '10:00 AM - 12:00 PM' },
            { activity: 'Creative work', time: '2:00 PM - 4:00 PM' },
          ],
          inauspiciousTimings: [
            { activity: 'Financial decisions', time: '6:00 PM - 8:00 PM' },
          ],
          aiModel: 'claude-3-haiku-20240307',
          tokensUsed: 2500,
          generationTimeMs: 3500,
          promptVersion: 'v1.0',
          status: 'published',
          publishedAt: new Date(),
        },
      });
    }

    console.log(`✅ Created user: ${user.email} (${userData.planType} plan)`);
  }

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Test Accounts Created:');
  console.log('Email: test@chandrahoro.com | Password: password123 | Plan: Free');
  console.log('Email: pro@chandrahoro.com | Password: password123 | Plan: Pro');
  console.log('Email: admin@chandrahoro.com | Password: password123 | Plan: Enterprise');
  console.log('\n🔗 You can now sign in at: http://localhost:3000/auth/signin');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
