-- Exported from QuickDBD: https://www.quickdatabasediagrams.com/
-- Link to schema: https://app.quickdatabasediagrams.com/#/d/dVPG3x
-- NOTE! If you have used non-SQL datatypes in your design, you will have to change these here.


CREATE TABLE "Stations" (
    "ID" Serial   NOT NULL,
    "Title" text   NOT NULL,
    "AddressLine1" text   NOT NULL,
    "Town" text   NOT NULL,
    "StateOrProvince" text   NOT NULL,
    "Postcode" text   NOT NULL,
    "Latitude" float   NOT NULL,
    "Longitude" float   NOT NULL,
    "ConnectionTypeIDs" int   NOT NULL,
    "PowerKWs" float   NOT NULL,
    "CurrentTypeIDs" text   NOT NULL,
    "OperatorID" int   NOT NULL,
    "UsageTypeID" int   NOT NULL,
    "UsageCost" varchar   NOT NULL,
    "NumberOfPoints" int   NOT NULL,
    "StatusTypeID" int   NOT NULL,
    "LUnknownCount" int   NOT NULL,
    "L1Count" int   NOT NULL,
    "L2Count" int   NOT NULL,
    "L3Count" int   NOT NULL,
    "AddressLine2" text   NOT NULL,
    "DatePlanned" date   NOT NULL,
    CONSTRAINT "pk_Stations" PRIMARY KEY (
        "ID"
     )
);

CREATE TABLE "ConnectionTypes" (
    "ID" int   NOT NULL,
    "Title" text   NOT NULL,
    "FormalName" text   NOT NULL,
    "IsDiscontinued" boolean   NOT NULL,
    "IsObsolete" boolean   NOT NULL,
    CONSTRAINT "pk_ConnectionTypes" PRIMARY KEY (
        "ID"
     )
);

CREATE TABLE "CurrentTypes" (
    "ID" int   NOT NULL,
    "Title" text   NOT NULL,
    "Description" text   NOT NULL,
    CONSTRAINT "pk_CurrentTypes" PRIMARY KEY (
        "ID"
     )
);

CREATE TABLE "OperatorTypes" (
    "ID" int   NOT NULL,
    "Title" text   NOT NULL,
    "IsPrivateIndividual" boolean   NOT NULL,
    "Comments" boolean   NOT NULL,
    CONSTRAINT "pk_OperatorTypes" PRIMARY KEY (
        "ID"
     )
);

CREATE TABLE "UsageTypes" (
    "ID" int   NOT NULL,
    "Title" text   NOT NULL,
    "IsPayAtLocation" boolean   NOT NULL,
    "IsMembershipRequired" boolean   NOT NULL,
    "IsAccessKeyRequired" boolean   NOT NULL,
    CONSTRAINT "pk_UsageTypes" PRIMARY KEY (
        "ID"
     )
);

CREATE TABLE "StatusTypes" (
    "ID" int   NOT NULL,
    "Title" text   NOT NULL,
    "IsOperational" boolean   NOT NULL,
    CONSTRAINT "pk_StatusTypes" PRIMARY KEY (
        "ID"
     )
);

ALTER TABLE "Stations" ADD CONSTRAINT "fk_Stations_ConnectionTypeIDs" FOREIGN KEY("ConnectionTypeIDs")
REFERENCES "ConnectionTypes" ("ID");

ALTER TABLE "Stations" ADD CONSTRAINT "fk_Stations_CurrentTypeIDs" FOREIGN KEY("CurrentTypeIDs")
REFERENCES "CurrentTypes" ("ID");

ALTER TABLE "Stations" ADD CONSTRAINT "fk_Stations_OperatorID" FOREIGN KEY("OperatorID")
REFERENCES "OperatorTypes" ("ID");

ALTER TABLE "Stations" ADD CONSTRAINT "fk_Stations_UsageTypeID" FOREIGN KEY("UsageTypeID")
REFERENCES "UsageTypes" ("ID");

ALTER TABLE "Stations" ADD CONSTRAINT "fk_Stations_StatusTypeID" FOREIGN KEY("StatusTypeID")
REFERENCES "StatusTypes" ("ID");

