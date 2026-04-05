\documentclass[12pt,onecolumn]{IEEEtran}

\usepackage[a4paper,margin=1in]{geometry}
\usepackage{setspace}
\onehalfspacing

\usepackage[utf8]{inputenc}
\usepackage{amsmath,amssymb}
\usepackage{graphicx}
\usepackage{array}
\usepackage{booktabs}
\usepackage{multirow}
\usepackage{url}
\usepackage{hyperref}
\usepackage{float}
\usepackage{listings}
\usepackage{xcolor}
\usepackage{caption}
\usepackage{longtable}
\usepackage{enumitem}
\usepackage{titlesec}

\hypersetup{
    colorlinks=true,
    linkcolor=black,
    filecolor=black,
    urlcolor=blue,
    citecolor=black
}

\titleformat{\section}{\large\bfseries}{\thesection.}{0.5em}{}
\titleformat{\subsection}{\normalsize\bfseries}{\thesubsection}{0.5em}{}
\titleformat{\subsubsection}{\normalsize\itshape}{\thesubsubsection}{0.5em}{}

\lstset{
    basicstyle=\ttfamily\footnotesize,
    breaklines=true,
    frame=single,
    columns=fullflexible,
    keepspaces=true,
    keywordstyle=\color{blue},
    commentstyle=\color{green!50!black},
    stringstyle=\color{red!70!black},
    showstringspaces=false
}

\begin{document}

\title{\textbf{Design and Implementation of a Relational Food Delivery Application Database}}

\begin{center}

{\LARGE \textbf{Design and Implementation of a Relational}}\\[0.3cm]
{\LARGE \textbf{Food Delivery Application Database}}\\[1cm]

\begin{tabular}{ccc}
\textbf{Rajit Mohan Shrivastava} & \textbf{Prayatshu Misra} & \textbf{Eknoor Singh Chhabra} \\[0.2cm]
Reg. No.: 240962378 & Reg. No.: 240962386 & Reg. No.: 240962412 \\[0.15cm]
Roll No.: 27 & Roll No.: 28 & Roll No.: 30 \\[0.15cm]
Semester IV (AIML-B) & Semester IV (AIML-B) & Semester IV (AIML-B) \\
\end{tabular}

\vspace{0.8cm}

Department of School of Computer Engineering\\
Manipal Institute of Technology, MAHE, Manipal, India\\[0.3cm]

\textbf{Under the guidance of}\\
Dr. Gangothri S.\\
Assistant Professor, School of Computer Engineering

\end{center}

\vspace{0.5cm}

\begin{abstract}

The rapid growth of online food delivery services has created a need for efficient database systems capable of managing customers, restaurants, menu items, orders, deliveries, payments, and reviews in an integrated and reliable manner. This paper presents the design and implementation of a relational database for a Food Delivery Application inspired by real-world platforms such as Swiggy and Zomato.

The proposed system is designed to handle essential food delivery operations including customer registration, restaurant and menu management, order placement, payment tracking, delivery assignment, coupon handling, and customer reviews. The database schema is developed using relational modeling principles and normalized to reduce redundancy and maintain consistency. Primary keys, foreign keys, and integrity constraints are used to enforce valid relationships among entities.

This project demonstrates the practical application of core Database Management System (DBMS) concepts such as entity-relationship modeling, relational schema design, normalization, SQL query development, and transaction consistency. The implementation highlights how structured relational databases can support scalable and efficient food delivery operations while ensuring reliable data storage and retrieval.

\end{abstract}

\begin{IEEEkeywords}
Database Management System, Food Delivery Application, Relational Database, SQL, Normalization, ER Model, Order Management, Oracle SQL Plus
\end{IEEEkeywords}

\section{Introduction}

The online food delivery industry has transformed the way customers interact with restaurants by providing a convenient digital platform for browsing menus, placing orders, making payments, and tracking deliveries in real time. Modern food delivery applications must manage a large amount of interconnected data involving customers, restaurants, menu items, orders, delivery partners, and transactions.

A well-designed relational database is essential for maintaining consistency, reducing redundancy, and ensuring smooth execution of operations in such systems. Without a structured backend database, food delivery platforms may encounter issues such as duplicate orders, inconsistent payment records, incorrect delivery assignments, and inefficient reporting.

This project focuses on the design and implementation of a Relational Food Delivery Application Database that models the core functionalities of a real-world food ordering and delivery platform. The system is developed as a DBMS mini-project to demonstrate practical database design and implementation concepts.

\subsection{Problem Statement}

Food delivery platforms require continuous handling of high-volume transactional data. If the database is poorly structured, it can lead to several operational problems such as:

\begin{itemize}
    \item Order duplication and incomplete transaction records
    \item Inconsistent restaurant and menu data
    \item Incorrect delivery partner assignment
    \item Payment mismatches and failed order tracking
    \item Redundant storage and inefficient query execution
\end{itemize}

Therefore, there is a need for a centralized and normalized relational database system that ensures data integrity, supports efficient retrieval, and models the workflow of an online food delivery platform.

\subsection{Objectives}

The main objectives of this project are:

\begin{itemize}
    \item To design an optimized relational schema for a food delivery application
    \item To implement entity relationships using primary key and foreign key constraints
    \item To apply normalization techniques for minimizing redundancy
    \item To support food ordering, delivery, payment, and review management
    \item To develop SQL queries for reporting and analytics such as revenue, order history, and popular dishes
    \item To ensure consistency and integrity in transactional data handling
\end{itemize}

\subsection{Scope}

The scope of the proposed system includes:

\begin{itemize}
    \item Customer registration, address management, and favorites tracking
    \item Restaurant and restaurant owner management
    \item Menu and category management
    \item Order placement, specific instructions, and preparation time tracking
    \item Payment and restaurant-specific coupon management
    \item Delivery partner assignment and real-time delivery tracking
    \item Item-level customer review and rating management
\end{itemize}

\subsection{Limitations}

The current implementation is limited to:

\begin{itemize}
    \item A relational backend database only
    \item No real-time GPS or map integration
    \item No mobile application or frontend integration in the current phase
    \item No AI-based recommendation or dynamic pricing system
\end{itemize}

\section{Related Concepts and Background}

A food delivery platform is a transaction-intensive system where multiple users and services interact with the same dataset. Such applications rely heavily on relational database systems to maintain data consistency and enable structured operations.

The project applies several important DBMS concepts:

\begin{itemize}
    \item \textbf{Entity-Relationship Modeling} for conceptual system design
    \item \textbf{Relational Schema Design} for structured table representation
    \item \textbf{Normalization} to reduce redundancy and anomalies
    \item \textbf{Primary and Foreign Key Constraints} to enforce relationships
    \item \textbf{SQL Queries} for data manipulation and retrieval
    \item \textbf{Transaction Consistency} for order and payment processing
\end{itemize}

These concepts collectively form the foundation of a robust and scalable food delivery database system.

\section{System Analysis and Requirements}

\subsection{Functional Requirements}

\subsubsection{Customer Management}

\begin{itemize}
    \item Register and manage customer information
    \item Store customer contact details and delivery addresses
\end{itemize}

\subsubsection{Restaurant Management}

\begin{itemize}
    \item Store restaurant details and operating hours
    \item Associate restaurants with owners and cuisine types
\end{itemize}

\subsubsection{Menu Management}

\begin{itemize}
    \item Maintain menu categories and menu items
    \item Track item pricing and availability status
\end{itemize}

\subsubsection{Order Management}

\begin{itemize}
    \item Allow customers to place orders
    \item Store ordered items, quantities, and subtotals
    \item Maintain order status and total amount
\end{itemize}

\subsubsection{Payment and Delivery Management}

\begin{itemize}
    \item Track payment status and payment methods
    \item Assign delivery partners to orders
    \item Store pickup and delivery timestamps
\end{itemize}

\subsubsection{Review and Coupon Management}

\begin{itemize}
    \item Allow customers to review restaurants
    \item Store discount coupons and eligibility conditions
\end{itemize}

\subsection{Non-Functional Requirements}

The following non-functional requirements were considered:

\begin{itemize}
    \item \textbf{Performance:} Fast retrieval of orders, menus, and transaction history
    \item \textbf{Reliability:} Consistent order and payment handling
    \item \textbf{Scalability:} Support for multiple customers, restaurants, and deliveries
    \item \textbf{Maintainability:} Modular schema design for future extensions
    \item \textbf{Integrity:} Valid constraints to prevent inconsistent records
\end{itemize}

\section{System Design}

\subsection{Major Entities}

The major entities used in the proposed system are:

\begin{itemize}
    \item \textbf{Customers}
    \item \textbf{Customer\_Addresses}
    \item \textbf{Favorites}
    \item \textbf{Restaurants}
    \item \textbf{Restaurant\_Owners}
    \item \textbf{Menu\_Categories}
    \item \textbf{Menu\_Items}
    \item \textbf{Orders}
    \item \textbf{Order\_Details}
    \item \textbf{Payments}
    \item \textbf{Delivery\_Partners}
    \item \textbf{Deliveries}
    \item \textbf{Reviews}
    \item \textbf{Coupons}
\end{itemize}

\subsection{Entity-Relationship Model}

The database models the workflow of a food delivery platform. Customers place orders from restaurants, each order contains multiple menu items, and each order is linked to payment and delivery details. Restaurants are managed by restaurant owners and maintain categorized menu items. Customers can also provide reviews and use coupons where applicable.

\subsection{ER Diagram}

Figure~\ref{fig:er} illustrates the conceptual Entity-Relationship structure of the proposed system.

\begin{figure}[H]
    \centering
    \includegraphics[width=0.8\textwidth]{er_diagram.png}
    \caption{Entity-Relationship Diagram of the Food Delivery Application}
    \label{fig:er}
\end{figure}

\textit{Replace the placeholder image with your exported ER diagram from Draw.io, dbdiagram.io, Lucidchart, or MySQL Workbench.}

\subsection{Relational Schema}

The relational schema of the proposed database is presented in Table~\ref{tab:schema}.

\begin{table}[H]
\caption{Relational Schema of the Food Delivery Application}
\label{tab:schema}
\centering
\begin{tabular}{p{4cm} p{10.5cm}}
\toprule
\textbf{Table} & \textbf{Attributes} \\
\midrule
Customers & Customer\_ID (PK), Name, Email, Phone\_Number, Address, Registration\_Date \\
Customer\_Addresses & Address\_ID (PK), Customer\_ID (FK), Address\_Label, Address\_Text, Is\_Default, Created\_At \\
Favorites & Favorite\_ID (PK), Customer\_ID (FK), Restaurant\_ID (FK), Item\_ID (FK), Created\_At \\
Restaurants & Restaurant\_ID (PK), Restaurant\_Name, Location, Contact\_Number, Cuisine\_Type, Opening\_Time, Closing\_Time, Rating \\
Restaurant\_Owners & Owner\_ID (PK), Owner\_Name, Email, Phone\_Number, Restaurant\_ID (FK) \\
Menu\_Categories & Category\_ID (PK), Restaurant\_ID (FK), Category\_Name \\
Menu\_Items & Item\_ID (PK), Restaurant\_ID (FK), Category\_ID (FK), Item\_Name, Description, Price, Availability\_Status \\
Orders & Order\_ID (PK), Customer\_ID (FK), Restaurant\_ID (FK), Order\_Date, Total\_Amount, Order\_Status, Delivery\_Address, Estimated\_Prep\_Time, Dispatched\_At \\
Order\_Details & Order\_Detail\_ID (PK), Order\_ID (FK), Item\_ID (FK), Quantity, Subtotal, Special\_Instructions \\
Payments & Payment\_ID (PK), Order\_ID (FK), Payment\_Method, Payment\_Status, Amount\_Paid, Payment\_Date \\
Delivery\_Partners & Partner\_ID (PK), Name, Phone\_Number, Vehicle\_Type, Availability\_Status \\
Deliveries & Delivery\_ID (PK), Order\_ID (FK), Partner\_ID (FK), Pickup\_Time, Delivery\_Time, Delivery\_Status \\
Reviews & Review\_ID (PK), Customer\_ID (FK), Restaurant\_ID (FK), Item\_ID (FK), Rating, Comment, Review\_Date \\
Coupons & Coupon\_ID (PK), Restaurant\_ID (FK), Coupon\_Code, Discount\_Type, Discount\_Value, Expiry\_Date, Minimum\_Order\_Value \\
\bottomrule
\end{tabular}
\end{table}

\subsection{Normalization}

The schema was normalized up to \textbf{Third Normal Form (3NF)} to ensure efficient storage and consistency.

\subsubsection{First Normal Form (1NF)}

All attributes contain atomic values with no repeating groups.

\subsubsection{Second Normal Form (2NF)}

All non-key attributes are fully functionally dependent on the entire primary key.

\subsubsection{Third Normal Form (3NF)}

No transitive dependencies exist among non-key attributes.

This normalization reduces redundancy and minimizes insertion, deletion, and update anomalies.

\section{Database Implementation}

\subsection{Platform Used}

The database is implemented using:

\begin{itemize}
    \item \textbf{DBMS Tool:} Oracle SQL Plus
    \item \textbf{Database Type:} Relational Database
\end{itemize}

\subsection{Representative Table Design}

A few representative table structures are shown below.

\begin{lstlisting}[language=SQL, caption={Customers Table}]
CREATE TABLE Customers (
    Customer_ID NUMBER PRIMARY KEY,
    Name VARCHAR2(100) NOT NULL,
    Email VARCHAR2(100) UNIQUE,
    Phone_Number VARCHAR2(15),
    Address VARCHAR2(255),
    Registration_Date DATE
);
\end{lstlisting}

\begin{lstlisting}[language=SQL, caption={Restaurants Table}]
CREATE TABLE Restaurants (
    Restaurant_ID NUMBER PRIMARY KEY,
    Restaurant_Name VARCHAR2(100) NOT NULL,
    Location VARCHAR2(150),
    Contact_Number VARCHAR2(15),
    Cuisine_Type VARCHAR2(50),
    Opening_Time VARCHAR2(20),
    Closing_Time VARCHAR2(20),
    Rating NUMBER(2,1)
);
\end{lstlisting}

\begin{lstlisting}[language=SQL, caption={Orders Table}]
CREATE TABLE Orders (
    Order_ID NUMBER PRIMARY KEY,
    Customer_ID NUMBER,
    Restaurant_ID NUMBER,
    Order_Date DATE,
    Total_Amount NUMBER(10,2),
    Order_Status VARCHAR2(30),
    Delivery_Address VARCHAR2(255),
    Estimated_Prep_Time NUMBER DEFAULT 30,
    Dispatched_At DATE,
    FOREIGN KEY (Customer_ID) REFERENCES Customers(Customer_ID),
    FOREIGN KEY (Restaurant_ID) REFERENCES Restaurants(Restaurant_ID)
);
\end{lstlisting}

\begin{lstlisting}[language=SQL, caption={Order Details Table}]
CREATE TABLE Order_Details (
    Order_Detail_ID NUMBER PRIMARY KEY,
    Order_ID NUMBER,
    Item_ID NUMBER,
    Quantity NUMBER,
    Subtotal NUMBER(10,2),
    Special_Instructions VARCHAR2(255),
    FOREIGN KEY (Order_ID) REFERENCES Orders(Order_ID),
    FOREIGN KEY (Item_ID) REFERENCES Menu_Items(Item_ID)
);
\end{lstlisting}

\subsection{Constraints and Integrity Rules}

The following constraints are used in the database design:

\begin{itemize}
    \item \textbf{Primary Keys} for unique identification of records
    \item \textbf{Foreign Keys} for maintaining valid inter-table relationships
    \item \textbf{Unique Constraints} for fields such as customer and owner email IDs
    \item \textbf{Check Constraints} for valid ratings, payment values, and quantity fields
    \item \textbf{Not Null Constraints} for mandatory fields
\end{itemize}

\section{SQL Query Design and Operations}

\subsection{Basic Operations}

\subsubsection{Insert Queries}

\begin{lstlisting}[language=SQL, caption={Sample Insert Queries}]
INSERT INTO Customers
VALUES (101, 'Aarav Sharma', 'aarav@example.com', '9876543210',
        'Manipal, Karnataka', TO_DATE('2025-09-01','YYYY-MM-DD'));

INSERT INTO Restaurants
VALUES (201, 'Spice Hub', 'Manipal', '9988776655',
        'Indian', '09:00 AM', '11:00 PM', 4.5);
\end{lstlisting}

\subsubsection{Select Queries}

\begin{lstlisting}[language=SQL, caption={Sample Select Queries}]
SELECT * FROM Customers;

SELECT Restaurant_Name, Cuisine_Type, Rating
FROM Restaurants
WHERE Rating >= 4.0;
\end{lstlisting}

\subsubsection{Update and Delete Queries}

\begin{lstlisting}[language=SQL, caption={Sample Update and Delete Queries}]
UPDATE Orders
SET Order_Status = 'Delivered'
WHERE Order_ID = 301;

DELETE FROM Reviews
WHERE Review_ID = 501;
\end{lstlisting}

\subsection{Complex Queries}

\subsubsection{Join Query}

\begin{lstlisting}[language=SQL, caption={Join Query for Customer Order History}]
SELECT c.Name, o.Order_ID, r.Restaurant_Name, o.Total_Amount, o.Order_Status
FROM Customers c
JOIN Orders o ON c.Customer_ID = o.Customer_ID
JOIN Restaurants r ON o.Restaurant_ID = r.Restaurant_ID;
\end{lstlisting}

\subsubsection{Aggregate Query}

\begin{lstlisting}[language=SQL, caption={Aggregate Query for Restaurant Revenue}]
SELECT r.Restaurant_Name, SUM(o.Total_Amount) AS Total_Revenue
FROM Restaurants r
JOIN Orders o ON r.Restaurant_ID = o.Restaurant_ID
GROUP BY r.Restaurant_Name;
\end{lstlisting}

\subsubsection{Popular Menu Items Query}

\begin{lstlisting}[language=SQL, caption={Query for Most Ordered Items}]
SELECT m.Item_Name, SUM(od.Quantity) AS Total_Ordered
FROM Menu_Items m
JOIN Order_Details od ON m.Item_ID = od.Item_ID
GROUP BY m.Item_Name
ORDER BY Total_Ordered DESC;
\end{lstlisting}

\subsubsection{Subquery}

\begin{lstlisting}[language=SQL, caption={Subquery for Highly Rated Restaurants}]
SELECT Restaurant_Name
FROM Restaurants
WHERE Restaurant_ID IN (
    SELECT Restaurant_ID
    FROM Reviews
    WHERE Rating >= 4
);
\end{lstlisting}

\section{Procedural SQL and Automation}

To enhance the practical applicability of the database and align the system with real-world business logic, the project also incorporates \textbf{stored procedures} and \textbf{triggers}. These database objects help automate repetitive tasks, enforce constraints, and maintain transactional consistency.

\subsection{Stored Procedures}

Stored procedures are predefined SQL blocks used to perform repetitive operations in a structured and reusable manner. In the proposed food delivery application, procedures can be used for customer registration, order placement, payment recording, and delivery assignment.

\subsubsection{Procedure for Adding a New Customer}

The following procedure inserts a new customer into the \texttt{Customers} table:
\clearpage
\begin{lstlisting}[language=SQL, caption={Stored Procedure to Add a Customer}]
CREATE OR REPLACE PROCEDURE Add_Customer(
    p_Customer_ID IN NUMBER,
    p_Name IN VARCHAR2,
    p_Email IN VARCHAR2,
    p_Phone_Number IN VARCHAR2,
    p_Address IN VARCHAR2,
    p_Registration_Date IN DATE
)
AS
BEGIN
    INSERT INTO Customers(Customer_ID, Name, Email, Phone_Number, Address, Registration_Date)
    VALUES(p_Customer_ID, p_Name, p_Email, p_Phone_Number, p_Address, p_Registration_Date);
END;
/
\end{lstlisting}

\subsubsection{Procedure for Placing an Order}

The following procedure inserts a new record into the \texttt{Orders} table:

\begin{lstlisting}[language=SQL, caption={Stored Procedure to Place an Order}]
CREATE OR REPLACE PROCEDURE Place_Order(
    p_Order_ID IN NUMBER,
    p_Customer_ID IN NUMBER,
    p_Restaurant_ID IN NUMBER,
    p_Order_Date IN DATE,
    p_Total_Amount IN NUMBER,
    p_Order_Status IN VARCHAR2,
    p_Delivery_Address IN VARCHAR2,
    p_Estimated_Prep_Time IN NUMBER,
    p_Dispatched_At IN DATE
)
AS
BEGIN
    INSERT INTO Orders(Order_ID, Customer_ID, Restaurant_ID, Order_Date, Total_Amount, Order_Status, Delivery_Address, Estimated_Prep_Time, Dispatched_At)
    VALUES(p_Order_ID, p_Customer_ID, p_Restaurant_ID, p_Order_Date, p_Total_Amount, p_Order_Status, p_Delivery_Address, p_Estimated_Prep_Time, p_Dispatched_At);
END;
/
\end{lstlisting}

\subsubsection{Procedure for Recording a Payment}

The following procedure stores payment information for a given order:
\clearpage
\begin{lstlisting}[language=SQL, caption={Stored Procedure to Record Payment}]
CREATE OR REPLACE PROCEDURE Record_Payment(
    p_Payment_ID IN NUMBER,
    p_Order_ID IN NUMBER,
    p_Payment_Method IN VARCHAR2,
    p_Payment_Status IN VARCHAR2,
    p_Amount_Paid IN NUMBER,
    p_Payment_Date IN DATE
)
AS
BEGIN
    INSERT INTO Payments(Payment_ID, Order_ID, Payment_Method, Payment_Status, Amount_Paid, Payment_Date)
    VALUES(p_Payment_ID, p_Order_ID, p_Payment_Method, p_Payment_Status, p_Amount_Paid, p_Payment_Date);
END;
/
\end{lstlisting}

\subsection{Triggers}

Triggers are database objects that automatically execute in response to specific events such as \texttt{INSERT}, \texttt{UPDATE}, or \texttt{DELETE}. In this project, triggers are used to validate important business rules and ensure data integrity.

\subsubsection{Trigger to Validate Restaurant Rating}

The following trigger ensures that the rating of a restaurant remains between 1 and 5.

\begin{lstlisting}[language=SQL, caption={Trigger to Validate Restaurant Rating}]
CREATE OR REPLACE TRIGGER Check_Restaurant_Rating
BEFORE INSERT OR UPDATE ON Restaurants
FOR EACH ROW
BEGIN
    IF :NEW.Rating < 1 OR :NEW.Rating > 5 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Rating must be between 1 and 5');
    END IF;
END;
/
\end{lstlisting}

\subsubsection{Trigger to Prevent Negative Payment Values}

The following trigger ensures that the amount paid for an order cannot be negative.

\begin{lstlisting}[language=SQL, caption={Trigger to Prevent Negative Payments}]
CREATE OR REPLACE TRIGGER Check_Payment_Amount
BEFORE INSERT OR UPDATE ON Payments
FOR EACH ROW
BEGIN
    IF :NEW.Amount_Paid < 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Amount paid cannot be negative');
    END IF;
END;
/
\end{lstlisting}

\subsubsection{Trigger to Maintain Valid Order Quantity}

The following trigger ensures that ordered item quantities are greater than zero.

\begin{lstlisting}[language=SQL, caption={Trigger to Validate Order Quantity}]
CREATE OR REPLACE TRIGGER Check_Order_Quantity
BEFORE INSERT OR UPDATE ON Order_Details
FOR EACH ROW
BEGIN
    IF :NEW.Quantity <= 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'Quantity must be greater than zero');
    END IF;
END;
/
\end{lstlisting}

\subsection{Significance of Procedures and Triggers}

The use of procedures and triggers strengthens the database design by:

\begin{itemize}
    \item Automating repetitive operations
    \item Enforcing business rules directly at the database level
    \item Improving consistency and reducing manual errors
    \item Making the system more realistic and suitable for demonstration
\end{itemize}

\section{Frontend and Database Connectivity}

Although the primary focus of this mini-project is relational database design and implementation, the system can be extended with a simple frontend interface to simulate the user interaction of a food delivery platform. This enhances the practical usability of the project and supports the demonstration of end-to-end workflow.

\subsection{Frontend UI Design}

A basic frontend interface can be designed using HTML, CSS, and JavaScript to represent the major user interactions of the food delivery system. The proposed user interface may include the following modules:

\begin{itemize}
    \item Customer Registration and Login Page
    \item Restaurant Listing Page
    \item Menu Browsing Page
    \item Order Placement Page
    \item Payment Confirmation Page
    \item Delivery Tracking Dashboard
    \item Admin Panel for Database Operations
\end{itemize}

The frontend layout is expected to be simple, user-friendly, and organized in a way that reflects real-world food delivery applications.

\subsection{Database Connectivity}

The frontend can be connected to the Oracle database using middleware technologies such as Java, Python, PHP, or Node.js. Database connectivity enables user input from the interface to be inserted into the relational tables and allows query results to be displayed dynamically.

A sample pseudo-flow of database connectivity is as follows:

\begin{itemize}
    \item User submits order details from the frontend
    \item Application sends request to backend
    \item Backend executes SQL query or procedure
    \item Oracle database stores or retrieves the required data
    \item Output is displayed back to the user interface
\end{itemize}

\subsection{Significance of Connectivity Layer}

The integration of a frontend with the backend database improves the project by:

\begin{itemize}
    \item Demonstrating practical use of database systems in applications
    \item Enabling user-friendly interaction with stored data
    \item Supporting complete workflow demonstration during project evaluation
    \item Bridging the gap between database design and real-world deployment
\end{itemize}

\section{Expected Outcomes and Discussion}

The proposed database system is expected to successfully support the following operations:

\begin{itemize}
    \item Efficient storage and retrieval of customer, restaurant, and order data
    \item Structured handling of menu categories and food items
    \item Consistent linking of orders, payments, and deliveries
    \item Analytical reporting such as total revenue, order history, and popular dishes
    \item Reduction in redundancy and anomalies through normalized schema design
\end{itemize}

From a DBMS perspective, the project demonstrates practical understanding of:

\begin{itemize}
    \item Relational database design
    \item Real-world entity relationship mapping
    \item Normalization techniques
    \item SQL-based data manipulation and retrieval
    \item Integrity and consistency enforcement
\end{itemize}

\section{Future Enhancements}

The proposed system can be extended in the future with the following features:

\begin{itemize}
    \item Real-time order tracking with GPS integration
    \item Customer login and authentication modules
    \item Dynamic pricing and promotional campaign management
    \item AI-based restaurant and food recommendation system
    \item Inventory management for restaurant stock
    \item Mobile application and frontend dashboard integration
\end{itemize}

\section{Conclusion}

This project presents the design and implementation of a Relational Food Delivery Application Database as a practical DBMS mini-project. The system models the core operations of an online food delivery platform by integrating customer management, restaurant operations, menu handling, order processing, payment tracking, delivery management, and review collection into a structured relational database.

The project successfully demonstrates the application of key database concepts such as entity-relationship modeling, schema design, normalization, constraints, and SQL query development. It highlights how a well-structured relational database can efficiently support the backend operations of a real-world food delivery application.

Overall, the project serves as a strong academic demonstration of DBMS principles and provides a scalable foundation for future full-stack implementation.

\section*{Acknowledgment}

The authors would like to express their sincere gratitude to \textbf{Dr. Gangothri S.}, Assistant Professor, School of Computer Engineering, Manipal Institute of Technology, for her valuable guidance, support, and encouragement throughout the development of this project. The authors also thank the faculty of the Database Systems Laboratory for providing the opportunity to work on this practical and insightful mini-project.

\begin{thebibliography}{00}

\bibitem{b1} R. Elmasri and S. B. Navathe, \textit{Fundamentals of Database Systems}, 7th ed. Pearson, 2015.

\bibitem{b2} A. Silberschatz, H. F. Korth, and S. Sudarshan, \textit{Database System Concepts}, 7th ed. McGraw-Hill, 2019.

\bibitem{b3} Oracle Corporation, \textit{Oracle SQL Language Reference}. [Online]. Available: \url{https://docs.oracle.com/}

\bibitem{b4} \textit{Swiggy Official Website}. [Online]. Available: \url{https://www.swiggy.com/}

\bibitem{b5} \textit{Zomato Official Website}. [Online]. Available: \url{https://www.zomato.com/}

\end{thebibliography}

\appendices

\section{Sample Data}

\begin{lstlisting}[language=SQL, caption={Sample Customer Records}]
INSERT INTO Customers VALUES
(101, 'Aarav Sharma', 'aarav@example.com', '9876543210', 'Manipal', TO_DATE('2025-09-01','YYYY-MM-DD'));

INSERT INTO Customers VALUES
(102, 'Riya Mehta', 'riya@example.com', '9876501234', 'Udupi', TO_DATE('2025-09-02','YYYY-MM-DD'));
\end{lstlisting}
\clearpage
\begin{lstlisting}[language=SQL, caption={Sample Restaurant Records}]
INSERT INTO Restaurants VALUES
(201, 'Spice Hub', 'Manipal', '9988776655', 'Indian', '09:00 AM', '11:00 PM', 4.5);

INSERT INTO Restaurants VALUES
(202, 'Pizza Corner', 'Udupi', '9871234567', 'Italian', '10:00 AM', '12:00 AM', 4.2);
\end{lstlisting}

\section{Screenshots Placeholder}

Insert the following screenshots here:

\begin{itemize}
    \item ER Diagram
    \item Table Creation Outputs
    \item Sample Insert Query Outputs
    \item Join Query Output
    \item Aggregate Query Output
    \item SQL Plus Execution Screenshots
\end{itemize}

\end{document}