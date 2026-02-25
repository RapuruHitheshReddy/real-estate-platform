import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { S3Client } from "@aws-sdk/client-s3";
import { Location } from "@prisma/client";
import { Upload } from "@aws-sdk/lib-storage";
import axios from "axios";
import fs from "fs";
import crypto from "crypto";

const prisma = new PrismaClient();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

export const getProperties = async (
  req: Request,
  res: Response,
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
        Prisma.sql`p."propertyType" = ${propertyType}::"PropertyType"`,
      );
    }

    /* AMENITIES */

    if (amenities && amenities !== "any") {
      const amenitiesArray = String(amenities).split(",").filter(Boolean);

      if (amenitiesArray.length) {
        where.push(
          Prisma.sql`
          p.amenities @> ARRAY[
            ${Prisma.join(
              amenitiesArray.map((a) => Prisma.sql`${a}::"Amenity"`),
            )}
          ]::"Amenity"[]
        `,
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
      `,
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
        `,
        );
      }
    }

    /* GEO SEARCH */

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
      `,
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
        ) as location,

        json_build_object(
          'name', m.name,
          'email', m.email,
          'phoneNumber', m."phoneNumber",
          'cognitoId', m."cognitoId"
        ) as manager

      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      LEFT JOIN "Manager" m ON p."managerCognitoId" = m."cognitoId"

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
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: {
        location: true,
        manager: true,
      },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const coordinates: { coordinates: string }[] = await prisma.$queryRaw`
        SELECT ST_AsText(coordinates) as coordinates
        FROM "Location"
        WHERE id = ${property.location.id}
      `;

    const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
    const longitude = geoJSON?.coordinates?.[0] ?? null;
    const latitude = geoJSON?.coordinates?.[1] ?? null;

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
  } catch (err: any) {
    console.error("GET PROPERTY ERROR:", err);

    res.status(500).json({
      message: "Error retrieving property",
      error: err.message,
    });
  }
};

export const createProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("---- CREATE PROPERTY REQUEST ----");

    console.log("Headers:", req.headers);
    console.log("Body fields:", Object.keys(req.body));

    const files = (req.files as Express.Multer.File[]) || [];

    console.log("Files received:", files.length);

    files.forEach((file, i) => {
      console.log(`File ${i + 1}`, {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        hasBuffer: !!file.buffer,
        bufferLength: file.buffer?.length,
        path: file.path,
      });
    });

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
      console.error("❌ No files received from multer");
      res.status(400).json({ message: "At least one photo is required" });
      return;
    }

    /* -----------------------------
       UPLOAD IMAGES TO S3
    ------------------------------ */

    const photoUrls: string[] = [];

    for (const file of files) {
      try {
        console.log("Processing file:", file.originalname);

        let fileBody: Buffer | null = null;

        if (file.buffer && file.buffer.length) {
          console.log("Using multer memory buffer");
          fileBody = file.buffer;
        } else if (file.path) {
          console.log("Reading file from disk path:", file.path);
          fileBody = fs.readFileSync(file.path);
        }

        if (!fileBody || !fileBody.length) {
          console.error("❌ Empty file buffer:", file.originalname);
          continue;
        }

        console.log("File size going to S3:", fileBody.length);

        const key = `properties/${Date.now()}-${crypto.randomUUID()}-${file.originalname}`;

        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: key,
          Body: fileBody,
          ContentType: file.mimetype,
        };

        console.log("Uploading to S3:", key);

        const uploadResult = await new Upload({
          client: s3Client,
          params: uploadParams,
        }).done();

        console.log("S3 upload result:", uploadResult);

        if (uploadResult?.Location) {
          photoUrls.push(uploadResult.Location);
        }
      } catch (err) {
        console.error("❌ S3 upload failed:", err);
      }
    }

    if (!photoUrls.length) {
      console.error("❌ No images uploaded to S3");
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

      console.log("Geocoding URL:", geocodingUrl);

      const geocodingResponse = await axios.get(geocodingUrl, {
        headers: {
          "User-Agent": "RentifulApp (support@rentiful.com)",
        },
      });

      if (geocodingResponse.data?.length) {
        longitude = parseFloat(geocodingResponse.data[0].lon);
        latitude = parseFloat(geocodingResponse.data[0].lat);
      }

      console.log("Coordinates:", { longitude, latitude });
    } catch (err) {
      console.warn("⚠️ Geocoding failed, using fallback coordinates");
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
    } catch {
      res.status(400).json({
        message: "Invalid amenities or highlights format",
      });
      return;
    }

    delete propertyData.amenities;
    delete propertyData.highlights;

    /* -----------------------------
       NUMBER SAFETY
    ------------------------------ */

    const pricePerMonth = Number(propertyData.pricePerMonth) || 0;
    const securityDeposit = Number(propertyData.securityDeposit) || 0;
    const applicationFee = Number(propertyData.applicationFee) || 0;
    const beds = Number(propertyData.beds) || 0;
    const baths = Number(propertyData.baths) || 0;
    const squareFeet = Number(propertyData.squareFeet) || 0;

    /* -----------------------------
       CREATE PROPERTY
    ------------------------------ */

    console.log("Creating property in DB");

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

        pricePerMonth,
        securityDeposit,
        applicationFee,

        beds,
        baths,
        squareFeet,
      },
      include: {
        location: true,
        manager: true,
      },
    });

    console.log("✅ Property created:", newProperty.id);

    res.status(201).json(newProperty);
  } catch (err: any) {
    console.error("❌ CREATE PROPERTY ERROR:", err);

    res.status(500).json({
      message: "Error creating property",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};
