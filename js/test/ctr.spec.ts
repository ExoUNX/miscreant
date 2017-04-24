// Copyright (C) 2016 Dmitry Chestnykh
// MIT License. See LICENSE file for details.

import { suite, test } from "mocha-typescript";
import { expect } from "chai";
import { AES } from "../src/aes";
import { encode, decode } from "../src/hex";
import { CTR } from "../src/ctr";

@suite class AESCTRSpec {
  static readonly v = {
    key: "000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F",
    iv: "202122232425262728292A2B2C2D2E2F",
    src1: "000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F202122",
    dst1: "61A7916D4A8A161B14C8F398B94FAEDBA3A3E29AD93F55451ED31FE92D3ABF841C7C81",
    src2: "00000000000000000000",
    dst2: "CA4E6112D03D4890166B"
  };

  @test "should correctly encrypt"() {
    const v = AESCTRSpec.v;
    const cipher = new AES(decode(v.key));
    const ctr = new CTR(cipher, decode(v.iv));
    const dst1 = new Uint8Array(decode(v.dst1).length);
    ctr.streamXOR(decode(v.src1), dst1);
    expect(encode(dst1)).to.eq(v.dst1);
    // Continue the same stream.
    const dst2 = new Uint8Array(decode(v.dst2).length);
    ctr.streamXOR(decode(v.src2), dst2);
    expect(encode(dst2)).to.eq(v.dst2);
  }

  @test "should generate succession when calling multiple times"() {
    const v = AESCTRSpec.v;
    const cipher = new AES(decode(v.key));
    const dst1 = new Uint8Array(100);
    const dst2 = new Uint8Array(dst1.length);
    // full-length
    const ctr1 = new CTR(cipher, decode(v.iv));
    ctr1.stream(dst1);
    // partial
    const ctr2 = new CTR(cipher, decode(v.iv));
    ctr2.stream(dst2.subarray(0, 50));
    ctr2.stream(dst2.subarray(50));
    expect(encode(dst2)).to.eql(encode(dst1));
  }
}