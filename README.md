Monte Carlo Derivatives Pricing Engine

Project Overview

This project is a small quantitative finance application that prices options using Monte Carlo simulation. Instead of predicting a single future price of an asset, the program generates thousands of possible future price paths and uses them to estimate the expected payoff of an option.

The idea behind the project was to understand how stochastic processes and probability models are used in financial markets. I built a web dashboard where users can run simulations and see how option prices are derived from simulated price paths.

The system also compares the Monte Carlo estimate with the Black-Scholes analytical formula, so it becomes easier to see how close the simulation is to the theoretical result.

Markets Supported

The project focuses on major Indian indices:

NIFTY 50

BANK NIFTY

SENSEX

NIFTY 100

NIFTY MIDCAP 50

Market data is fetched using the Yahoo Finance API (yfinance).

Note: Yahoo Finance usually provides around 15 minute delayed market data.


Features

Some of the things implemented in the project:

Monte Carlo option pricing

Geometric Brownian Motion price simulation

Antithetic variates for variance reduction

Black-Scholes comparison

Greeks estimation

Stochastic path visualization

Terminal price distribution

Payoff distribution

Monte Carlo convergence plot

Variance reduction comparison

CSV export of simulation results

System Architecture

The application has three main components.

                +----------------------+
                |   Yahoo Finance API  |
                |    (Market Data)     |
                +----------+-----------+
                           |
                           v
                 +------------------+
                 |   FastAPI Backend|
                 |------------------|
                 | Market Data Fetch|
                 | Volatility Calc  |
                 | GBM Simulation   |
                 | Monte Carlo      |
                 | Variance Reduction|
                 +---------+--------+
                           |
                           v
                +----------------------+
                |  Next.js Frontend    |
                |----------------------|
                | Dashboard UI         |
                | Simulation Controls  |
                | Charts & Graphs      |
                +----------------------+
Technology Stack
Frontend

Next.js

TypeScript

TailwindCSS

Plotly / D3 for visualization

Backend

Python

FastAPI

Scientific Computing

NumPy

SciPy

Numba (for faster simulations)

Data Source

Yahoo Finance (via yfinance library)

Mathematical Model

The simulation assumes that prices follow Geometric Brownian Motion (GBM).

The stochastic differential equation is:

dS_t = r S_t dt + σ S_t dW_t

Where:

S_t = asset price
r = risk free rate
σ = volatility
W_t = Brownian motion

Discrete Simulation Formula

Since computers cannot work with continuous time, the equation is discretized.

S(t+Δt) = S(t) * exp((r − 0.5σ²)Δt + σ√Δt Z)

Where:

Z ~ N(0,1)

This random variable introduces the stochastic behavior in the price paths.

Monte Carlo Pricing

The pricing engine works in the following steps:

Simulate thousands of possible price paths

Compute the terminal price of each path

Calculate the payoff of the option

Take the average payoff

Discount the value back to present

Option Price = exp(-rT) × Expected Payoff
Variance Reduction

To improve accuracy the project uses Antithetic Variates.

For every random number 
𝑍
Z used in the simulation, the algorithm also simulates:

-Z

This helps reduce randomness in the estimator and makes the Monte Carlo result converge faster.

Running the Project
Clone the repository
git clone https://github.com/yourusername/monte-carlo-pricer.git
cd monte-carlo-pricer
Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
Frontend
cd frontend
npm install
npm run dev

Open in browser:

http://localhost:3000
What I Learned From This Project

Some of the main things I learned while building this project:

how stochastic processes are used in financial modeling

implementing Monte Carlo simulations efficiently

variance reduction techniques

how option pricing models work

integrating financial data APIs

building interactive dashboards for quantitative analysis

References

Some references that helped while working on this project:

Hull, J. – Options, Futures, and Other Derivatives

Shreve, S. – Stochastic Calculus for Finance

Glasserman, P. – Monte Carlo Methods in Financial Engineering

Black & Scholes (1973) – The Pricing of Options and Corporate Liabilities

Wikipedia pages on:

Geometric Brownian Motion

Monte Carlo Methods

Black-Scholes Model