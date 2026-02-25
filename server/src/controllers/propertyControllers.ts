import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { S3Client } from "@aws-sdk/client-s3";
import { Location } from "@prisma/client";
import { Upload } from "@aws-sdk/lib-storage";
import axios from "axios";

const prisma = new PrismaClient();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

export const getProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      favoriteIds,
      priceMin,
      priceMax,
      beds,
      baths,
      propertyType,
      squareFeetMin,
      squareFeetMax,
      amenities,
      availableFrom,
      latitude,
      longitude,
      location,
      page = "1",
      limit = "20",
    } = req.query;

    const where: Prisma.Sql[] = [];

    /* FAVORITES */

    if (favoriteIds) {
      const ids = String(favoriteIds)
        .split(",")
        .map(Number)
        .filter((id) => !isNaN(id));

      if (ids.length) {
        where.push(Prisma.sql`p.id IN (${Prisma.join(ids)})`);
      }
    }

    /* PRICE */

    const minPrice = Number(priceMin);
    if (!isNaN(minPrice)) {
      where.push(Prisma.sql`p."pricePerMonth" >= ${minPrice}`);
    }

    const maxPrice = Number(priceMax);
    if (!isNaN(maxPrice)) {
      where.push(Prisma.sql`p."pricePerMonth" <= ${maxPrice}`);
    }

    /* BEDS */

    const bedsNum = Number(beds);
    if (!isNaN(bedsNum)) {
      where.push(Prisma.sql`p.beds >= ${bedsNum}`);
    }

    /* BATHS */

    const bathsNum = Number(baths);
    if (!isNaN(bathsNum)) {
      where.push(Prisma.sql`p.baths >= ${bathsNum}`);
    }

    /* SQUARE FEET */

    const minSqft = Number(squareFeetMin);
    if (!isNaN(minSqft)) {
      where.push(Prisma.sql`p."squareFeet" >= ${minSqft}`);
    }

    const maxSqft = Number(squareFeetMax);
    if (!isNaN(maxSqft)) {
      where.push(Prisma.sql`p."squareFeet" <= ${maxSqft}`);
    }

    /* PROPERTY TYPE */

    if (propertyType && propertyType !== "any") {
      where.push(
        Prisma.sql`p."propertyType" = ${propertyType}::"PropertyType"`
      );
    }

    /* AMENITIES */

    if (amenities && amenities !== "any") {
      const amenitiesArray = String(amenities)
        .split(",")
        .filter(Boolean);

      if (amenitiesArray.length) {
        where.push(
          Prisma.sql`
          p.amenities @> ARRAY[
            ${Prisma.join(
              amenitiesArray.map(
                (a) => Prisma.sql`${a}::"Amenity"`
              )
            )}
          ]::"Amenity"[]
        `
        );
      }
    }

    /* TEXT LOCATION SEARCH */

    if (location) {
      const search = `%${location}%`;

      where.push(
        Prisma.sql`
        (
          l.city ILIKE ${search}
          OR l.state ILIKE ${search}
          OR l.country ILIKE ${search}
          OR l.address ILIKE ${search}
        )
      `
      );
    }

    /* AVAILABILITY */

    if (availableFrom && availableFrom !== "any") {
      const date = new Date(String(availableFrom));

      if (!isNaN(date.getTime())) {
        where.push(
          Prisma.sql`
          NOT EXISTS (
            SELECT 1
            FROM "Lease" lease
            WHERE lease."propertyId" = p.id
            AND lease."endDate" >= ${date.toISOString()}
          )
        `
        );
      }
    }

    /* GEO SEARCH (ONLY WHEN NO TEXT SEARCH) */

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!location && !isNaN(lat) && !isNaN(lng)) {
      const radiusMeters = 25000;

      where.push(
        Prisma.sql`
        ST_DWithin(
          l.coordinates::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          ${radiusMeters}
        )
      `
      );
    }

    /* PAGINATION */

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const offset = (pageNum - 1) * limitNum;

    /* FINAL QUERY */

    const query = Prisma.sql`
      SELECT 
        p.*,
        json_build_object(
          'id', l.id,
          'address', l.address,
          'city', l.city,
          'state', l.state,
          'country', l.country,
          'postalCode', l."postalCode",
          'coordinates', json_build_object(
            'longitude', ST_X(l.coordinates::geometry),
            'latitude', ST_Y(l.coordinates::geometry)
          )
        ) as location
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      ${
        where.length
          ? Prisma.sql`WHERE ${Prisma.join(where, " AND ")}`
          : Prisma.empty
      }
      ORDER BY p."postedDate" DESC
      LIMIT ${limitNum}
      OFFSET ${offset}
    `;

    const properties = await prisma.$queryRaw(query);

    res.json(properties);
  } catch (error: any) {
    console.error("getProperties error:", error);

    res.status(500).json({
      message: "Failed to retrieve properties",
    });
  }
};

export const getProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: {
        location: true,
      },
    });

    if (property) {
      const coordinates: { coordinates: string }[] =
        await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

      const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
      const longitude = geoJSON.coordinates[0];
      const latitude = geoJSON.coordinates[1];

      const propertyWithCoordinates = {
        ...property,
        location: {
          ...property.location,
          coordinates: {
            longitude,
            latitude,
          },
        },
      };
      res.json(propertyWithCoordinates);
    }
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error retrieving property: ${err.message}` });
  }
};

export const createProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];

    const {
      address,
      city,
      state,
      country,
      postalCode,
      managerCognitoId,
      ...propertyData
    } = req.body;

    /* -----------------------------
       BASIC VALIDATION
    ------------------------------ */

    if (!managerCognitoId) {
      res.status(400).json({ message: "Manager ID is required" });
      return;
    }

    if (!address || !city || !country) {
      res.status(400).json({ message: "Location fields are required" });
      return;
    }

    if (!files.length) {
      res.status(400).json({ message: "At least one photo is required" });
      return;
    }

    /* -----------------------------
       UPLOAD IMAGES TO S3
    ------------------------------ */

    const photoUrls: string[] = [];

    for (const file of files) {
      try {
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: `properties/${Date.now()}-${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const uploadResult = await new Upload({
          client: s3Client,
          params: uploadParams,
        }).done();

        if (uploadResult?.Location) {
          photoUrls.push(uploadResult.Location);
        }
      } catch (err) {
        console.error("S3 upload failed:", err);
      }
    }

    if (!photoUrls.length) {
      res.status(500).json({ message: "Image upload failed" });
      return;
    }

    /* -----------------------------
       GEOCODING
    ------------------------------ */

    let longitude = 0;
    let latitude = 0;

    try {
      const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
        {
          street: address,
          city,
          country,
          postalcode: postalCode,
          format: "json",
          limit: "1",
        }
      ).toString()}`;

      const geocodingResponse = await axios.get(geocodingUrl, {
        headers: {
          "User-Agent": "RentifulApp (support@rentiful.com)",
        },
      });

      if (geocodingResponse.data?.length) {
        longitude = parseFloat(geocodingResponse.data[0].lon);
        latitude = parseFloat(geocodingResponse.data[0].lat);
      }
    } catch (err) {
      console.warn("Geocoding failed, using fallback coordinates");
    }

    /* -----------------------------
       CREATE LOCATION
    ------------------------------ */

    const [location] = await prisma.$queryRaw<Location[]>`
      INSERT INTO "Location" 
      (address, city, state, country, "postalCode", coordinates)
      VALUES (
        ${address},
        ${city},
        ${state},
        ${country},
        ${postalCode},
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      )
      RETURNING 
        id, address, city, state, country, "postalCode",
        ST_AsText(coordinates) as coordinates;
    `;

    if (!location) {
      res.status(500).json({ message: "Failed to create location" });
      return;
    }

    /* -----------------------------
       PARSE ARRAYS SAFELY
    ------------------------------ */

    let amenities: string[] = [];
    let highlights: string[] = [];

    try {
      amenities =
        typeof propertyData.amenities === "string"
          ? JSON.parse(propertyData.amenities)
          : [];

      highlights =
        typeof propertyData.highlights === "string"
          ? JSON.parse(propertyData.highlights)
          : [];
    } catch (err) {
      res.status(400).json({
        message: "Invalid amenities or highlights format",
      });
      return;
    }

    /* -----------------------------
       CLEAN DATA
    ------------------------------ */

    delete propertyData.amenities;
    delete propertyData.highlights;

    /* -----------------------------
       CREATE PROPERTY
    ------------------------------ */

    const newProperty = await prisma.property.create({
      data: {
        ...propertyData,

        photoUrls,
        locationId: location.id,
        managerCognitoId,

        amenities,
        highlights,

        isPetsAllowed:
          propertyData.isPetsAllowed === true ||
          propertyData.isPetsAllowed === "true",

        isParkingIncluded:
          propertyData.isParkingIncluded === true ||
          propertyData.isParkingIncluded === "true",

        pricePerMonth: Number(propertyData.pricePerMonth),
        securityDeposit: Number(propertyData.securityDeposit),
        applicationFee: Number(propertyData.applicationFee),

        beds: Number(propertyData.beds),
        baths: Number(propertyData.baths),
        squareFeet: Number(propertyData.squareFeet),
      },
      include: {
        location: true,
        manager: true,
      },
    });

    res.status(201).json(newProperty);
  } catch (err: any) {
    console.error("CREATE PROPERTY ERROR:", err);

    res.status(500).json({
      message: "Error creating property",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};