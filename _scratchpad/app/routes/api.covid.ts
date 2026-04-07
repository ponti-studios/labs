import { and, eq, gte, lte, sql } from 'drizzle-orm';
import type { LoaderFunctionArgs } from 'react-router';
import { covidData, db } from '~/db';
import type { CovidDataSelect } from '~/db/schema';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Parse query parameters
    const country = searchParams.get('country');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Math.min(Number.parseInt(searchParams.get('limit') || '1000'), 5000); // Max 5000 items per page for data analysis

    // Validate pagination parameters
    if (page < 1) {
      return Response.json({ error: 'Page must be greater than 0' }, { status: 400 });
    }

    if (limit < 1) {
      return Response.json({ error: 'Limit must be greater than 0' }, { status: 400 });
    }

    // Build where conditions
    const conditions = [];

    // Filter by country if provided
    if (country && country !== 'global') {
      if (country === 'OWID_WRL') {
        // Global data in OWID format
        conditions.push(eq(covidData.isoCode, 'OWID_WRL'));
      } else {
        // Filter by ISO code or location name
        conditions.push(eq(covidData.isoCode, country));
      }
    }

    // Filter by date range if provided
    if (startDate) {
      conditions.push(gte(covidData.date, startDate));
    }

    if (endDate) {
      conditions.push(lte(covidData.date, endDate));
    }

    // Build the query based on whether we have conditions
    let records: CovidDataSelect[];
    let totalResult: { count: number }[];

    if (conditions.length > 0) {
      // With conditions
      records = await db
        .select()
        .from(covidData)
        .where(and(...conditions))
        .orderBy(covidData.date, covidData.location)
        .limit(limit)
        .offset((page - 1) * limit);

      totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(covidData)
        .where(and(...conditions));
    } else {
      // Without conditions
      records = await db
        .select()
        .from(covidData)
        .orderBy(covidData.date, covidData.location)
        .limit(limit)
        .offset((page - 1) * limit);

      totalResult = await db.select({ count: sql<number>`count(*)` }).from(covidData);
    }
    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return Response.json({
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        country,
        startDate,
        endDate,
      },
    });
  } catch (error) {
    console.error('Failed to load COVID data:', error);
    return Response.json({ error: 'Failed to load COVID data' }, { status: 500 });
  }
}
