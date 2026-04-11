# [1.2.0](https://github.com/PrasitSahu/stoozebot/compare/v1.1.0...v1.2.0) (2026-04-11)


### Bug Fixes

* remove delete message ([634ee26](https://github.com/PrasitSahu/stoozebot/commit/634ee26b768da21a538f411b6e5ba76bd5a8a530))


### Features

* add admit card download functionality and integrate SOA portals API services ([3a3ed99](https://github.com/PrasitSahu/stoozebot/commit/3a3ed9954ca5a8e13196dcfe6bc01c3c70d56062))

# [1.1.0](https://github.com/PrasitSahu/stoozebot/compare/v1.0.0...v1.1.0) (2026-04-11)


### Features

* implement result PDF download command with caching and remove unused R2 bucket configurations ([1ece77b](https://github.com/PrasitSahu/stoozebot/commit/1ece77bc3b119db934809bcff0d09b1a599febba))

# 1.0.0 (2026-04-10)


### Bug Fixes

* add account id to env in workflow ([994163d](https://github.com/PrasitSahu/stoozebot/commit/994163d8214c229f3e4449315f6c1b09076feca2))
* add answer callback query ([50fa6ea](https://github.com/PrasitSahu/stoozebot/commit/50fa6ea9dda2fb7653e61f301593bfcde7e76c41))
* add CF api token to env in workflow ([d2952a7](https://github.com/PrasitSahu/stoozebot/commit/d2952a79d3f81cbfbc688c0e436f5bf8b452ffa5))
* add env name ([b1609b5](https://github.com/PrasitSahu/stoozebot/commit/b1609b53edf4350750faa3ee6c339d3e50510714))
* attendance query to include regId and regCode ([445223e](https://github.com/PrasitSahu/stoozebot/commit/445223ef824dcbf7443d754bef75ab6488d2136a))
* attendance typo in help cmd ([547178e](https://github.com/PrasitSahu/stoozebot/commit/547178edf9e1997e11166652db752f26d9c1a1fe))
* auth middleware fetch logic ([59805d4](https://github.com/PrasitSahu/stoozebot/commit/59805d4aac5df4f3d2caac2b78ce2dd094e91401))
* change telegram user to user in middleware auth ([ffd284a](https://github.com/PrasitSahu/stoozebot/commit/ffd284af7c1a7b5629d4fa11df905d13fe67d10c))
* ci env ([c8c5417](https://github.com/PrasitSahu/stoozebot/commit/c8c541787dbe547343bb997694ab520b3f801b27))
* **ci:** add node v22 for semantic-release in workflow ([8f46126](https://github.com/PrasitSahu/stoozebot/commit/8f4612681bd062e8cd7ffbc6231f6c83d6860bef))
* **ci:** release workflow ([8f17e00](https://github.com/PrasitSahu/stoozebot/commit/8f17e00715a3ed9f02cae3bdaeac4784ae96817d))
* handle fail response errors ([0cdcfb9](https://github.com/PrasitSahu/stoozebot/commit/0cdcfb98654ab38d9f659e7bd95cd188502ae239))
* privacyToS accept bypass middleware ([f2ec6df](https://github.com/PrasitSahu/stoozebot/commit/f2ec6df2c9b8f8642f8f3d794dc9342b1b82e274))
* remove redundant tests ([44605da](https://github.com/PrasitSahu/stoozebot/commit/44605da7e91a61cacdd8330d69120767e3e33210))
* token expiration check to use seconds ([069c511](https://github.com/PrasitSahu/stoozebot/commit/069c511982bb67544738fecbf2303ea9e731ac07))
* update conflict target parameters on attendancesTable ([e41ad29](https://github.com/PrasitSahu/stoozebot/commit/e41ad2909bb56ef273ddaabf67a1652787a273ec))
* update schema ([4e8307a](https://github.com/PrasitSahu/stoozebot/commit/4e8307a2a12a3c2c02b6bd0edc4f17c1977b5beb))
* update schema ([5060406](https://github.com/PrasitSahu/stoozebot/commit/50604064339cbb8565a309a58be610d081a7184e))
* update secrets in prod job in deploy workflow ([1ffe13d](https://github.com/PrasitSahu/stoozebot/commit/1ffe13da76fab8d2f213930bea17300dac442383))


### Features

* add attendence command ([f8fa0fc](https://github.com/PrasitSahu/stoozebot/commit/f8fa0fc7ef4032b0f8bdc974bd84ccc0cf6bce88))
* add authToken table schema ([9239efd](https://github.com/PrasitSahu/stoozebot/commit/9239efde76da7983f2e9ac49834c48418225ee58))
* add botApiLimit middleware ([1bb1906](https://github.com/PrasitSahu/stoozebot/commit/1bb1906d69f47bca2aeb6a182b4b1c68d4e02277))
* add chat animation for attendance fetch ([0065951](https://github.com/PrasitSahu/stoozebot/commit/0065951667c0730996740a4906ceb84c8d1a7510))
* add check for bot secret ([cbb91c4](https://github.com/PrasitSahu/stoozebot/commit/cbb91c4c7a17500d0b20b42b7c4778de4bbe2fd4))
* add db schemas ([cf91bdf](https://github.com/PrasitSahu/stoozebot/commit/cf91bdfc1a0a20b6812ae1cf4a3927f7a8fa326e))
* add limit and logout ([2550fea](https://github.com/PrasitSahu/stoozebot/commit/2550feac031e315af8267a2da5c3d37da8e98ee3))
* add middlewares and start command ([850c038](https://github.com/PrasitSahu/stoozebot/commit/850c03801ec38fc07145c9808e7833ead9dbab25))
* add migrations, tests and deploy workflow ([b1042da](https://github.com/PrasitSahu/stoozebot/commit/b1042daa333eaacfbbc265316f4c95c237b24ee9))
* add privay policy and terms of service ([0457513](https://github.com/PrasitSahu/stoozebot/commit/0457513d9ea46fd0a22d5e6e6afd888d305ac740))
* add reqs field to platformUsers ([a4c51d9](https://github.com/PrasitSahu/stoozebot/commit/a4c51d92f370620a4db47bce65e91934c35dec28))
* add service layer for portal and login command ([65b5b9c](https://github.com/PrasitSahu/stoozebot/commit/65b5b9c557d8a1e95920542b629d5398c515ce0c))
* add updatecreds ([58e3fd1](https://github.com/PrasitSahu/stoozebot/commit/58e3fd1b08db995d9c0ee6d72c4302573d6dd593))
* implement Durable Object ([bc71763](https://github.com/PrasitSahu/stoozebot/commit/bc717636dfca5d2d4d23ae7b6638c105f5f9a2d5))
* Implement initial Telegram bot setup, command registration, and core command handlers. ([b0cb3fb](https://github.com/PrasitSahu/stoozebot/commit/b0cb3fb2828740fd6f748185073f0762d4e9bb21))
* implement refresh and cancel options to attendance ([217de01](https://github.com/PrasitSahu/stoozebot/commit/217de0133b8530559734c99b2c9904d6a1e69423))
* implement result fetch functionality ([a0c681b](https://github.com/PrasitSahu/stoozebot/commit/a0c681b33b512a648807afc9bbf9dc7ce5f5127d))
* implement result fetching and PDF download commands with database caching ([cea1a8f](https://github.com/PrasitSahu/stoozebot/commit/cea1a8f6a868dfe90154a36e72e4c026f9ef72d0))
* implement zod ([9f5a160](https://github.com/PrasitSahu/stoozebot/commit/9f5a16089a7ab7ae23e7b676b298583be829aae0))
* inform if site down ([8e555e1](https://github.com/PrasitSahu/stoozebot/commit/8e555e1b791ce90c9b519ba2a9bb4b3ffe9525c6))
* redact auth input ([cb2c669](https://github.com/PrasitSahu/stoozebot/commit/cb2c669931601fcb3d6a83ff3fd2c42b00acbd1b))
* save attendance to db ([5c08de8](https://github.com/PrasitSahu/stoozebot/commit/5c08de8ed3e1101890a0a48a0d2b452c8eb885b0))
