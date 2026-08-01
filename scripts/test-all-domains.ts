import { resolveRealUniversityUrl } from '../src/lib/url';

const testUniversities = [
  'UT Austin', 'utaustin.edu',
  'UCLA', 'ucla.edu',
  'University of Florida', 'universityofflorida.edu',
  'Dartmouth College', 'dartmouthcollege.edu',
  'Johns Hopkins University', 'johnshopkinsuniversity.edu',
  'Boston University', 'bostonuniversity.edu',
  'University of Pennsylvania', 'universityofpennsylvania.edu',
  'University of Maryland', 'universityofmaryland.edu',
  'Ohio State University', 'ohiostateuniversity.edu',
  'University of Washington', 'universityofwashington.edu',
  'University of Chicago', 'universityofchicago.edu',
  'Vanderbilt University', 'vanderbiltuniversity.edu',
  'Brown University', 'brownuniversity.edu',
  'Duke University', 'dukeuniversity.edu',
  'Purdue University', 'purdueuniversity.edu',
  'Georgia Tech', 'georgiatech.edu',
  'UIUC', 'uiuc.edu',
  'Cornell University', 'cornelluniversity.edu',
  'Columbia University', 'columbiauniversity.edu',
  'Princeton University', 'princetonuniversity.edu',
  'Caltech', 'caltech.edu',
  'CSULB', 'csulb.edu',
  'University of the Pacific', 'pacific.edu',
  'MIT', 'mit.edu',
  'Stanford University', 'stanford.edu',
  'Harvard University', 'harvard.edu',
  'UC Berkeley', 'berkeley.edu'
];

console.log('Testing domain resolution for all universities:');
for (const u of testUniversities) {
  console.log(`Input: "${u}" => Resolved Live URL: ${resolveRealUniversityUrl(u)}`);
}
