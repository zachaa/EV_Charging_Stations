CREATE TABLE Stations (
    "ID" Serial   NOT NULL,
    "Title" text   NOT NULL,
    "AddressLine1" text   NULL,
    "Town" text   NULL,
    "StateOrProvince" text   NOT NULL,
    "Postcode" text NULL,
    "Latitude" float   NOT NULL,
    "Longitude" float   NOT NULL,
    "ConnectionTypeIDs" text  NULL,
    "PowerKWs" text   NULL,
    "CurrentTypeIDs" text  NULL,
    "OperatorID" int   NOT NULL,
    "UsageTypeID" int   NOT NULL,
    "UsageCost" varchar    NULL,
    "NumberOfPoints" int   NOT NULL,
    "StatusTypeID" int   NOT NULL,
    "LUnknownCount" int   NOT NULL,
    "L1Count" int   NOT NULL,
    "L2Count" int   NOT NULL,
    "L3Count" int   NOT NULL,
    "AddressLine2" text    NULL,
    "DatePlanned" date  NULL,
    CONSTRAINT "pk_Stations" PRIMARY KEY (
        "ID"
     )
);

CREATE TABLE ConnectionTypes (
    "ID" int   NOT NULL,
    "Title" text   NOT NULL,
    "FormalName" text    NULL,
    "IsDiscontinued" BOOLEAN DEFAULT NULL,
    "IsObsolete" BOOLEAN DEFAULT NULL,
    CONSTRAINT "pk_ConnectionTypes" PRIMARY KEY (
        "ID"
     )
);

CREATE TABLE CurrentTypes (
    "ID" int   NOT NULL,
    "Title" text   NOT NULL,
    "Description" text   NOT NULL,
    CONSTRAINT "pk_CurrentTypes" PRIMARY KEY (
        "ID"
     )
);

CREATE TABLE OperatorTypes (
    "ID" int   NOT NULL,
    "Title" text   NOT NULL,
    "IsPrivateIndividual" BOOLEAN DEFAULT NULL,
    "Comments" text    NULL,
    CONSTRAINT "pk_OperatorTypes" PRIMARY KEY (
        "ID"
     )
);

CREATE TABLE UsageTypes (
    "ID" int   NOT NULL,
    "Title" text   NOT NULL,
    "IsPayAtLocation" BOOLEAN DEFAULT NULL,
    "IsMembershipRequired" BOOLEAN DEFAULT NULL,
    "IsAccessKeyRequired" BOOLEAN DEFAULT NULL,
    CONSTRAINT "pk_UsageTypes" PRIMARY KEY (
        "ID"
     )
);

CREATE TABLE StatusTypes (
    "ID" int   NOT NULL,
    "Title" text   NOT NULL,
    "IsOperational" BOOLEAN DEFAULT NULL,
    CONSTRAINT "pk_StatusTypes" PRIMARY KEY (
        "ID"
     )
);

ALTER TABLE Stations ADD CONSTRAINT "fk_Stations_OperatorID" FOREIGN KEY("OperatorID")
REFERENCES OperatorTypes ("ID");

ALTER TABLE Stations ADD CONSTRAINT "fk_Stations_UsageTypeID" FOREIGN KEY("UsageTypeID")
REFERENCES UsageTypes ("ID");

ALTER TABLE Stations ADD CONSTRAINT "fk_Stations_StatusTypeID" FOREIGN KEY("StatusTypeID")
REFERENCES StatusTypes ("ID");

SELECT * FROM connectiontypes;

SELECT * FROM currenttypes;

SELECT * FROM operatortypes;

SELECT * FROM statustypes;

SELECT * FROM usagetypes;

SELECT * FROM stations;